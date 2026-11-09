import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { createAnalyzeHandler } from "../lib/ai/analyze-server.ts";
import { applySuggestion, isAnalysisSuggestion } from "../lib/ai/contracts.ts";
const config = { enabled: "true", apiKey: "test-key", model: "test-vision-model", nodeEnv: "development" };
const suggestion = { category: "주방·카페", itemName: "커피머신", visibleFeatures: ["금속 외관"], checksNeeded: ["작동 상태 확인 필요"] } as const;
const image = `data:image/png;base64,${(await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).png().toBuffer()).toString("base64")}`;
const request = (value: unknown) => new Request("http://localhost/api/assets/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
function upstream(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }); }
const output = (data: unknown) => ({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(data) }] }] });
test("정상 이미지와 모의 응답을 서버에서 검증하고 분석 제안을 반환", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (_url, init) => { calls++; const body = JSON.parse(String(init?.body)); assert.equal(body.store, false); assert.equal(body.model, "test-vision-model"); assert.equal(body.input[0].content[1].image_url, image); assert.equal(body.text.format.strict, true); return upstream(output(suggestion)); };
  const handler = createAnalyzeHandler({ getConfig: () => config, fetcher });
  const res = await handler(request({ image })); assert.equal(res.status, 200); assert.deepEqual((await res.json()).suggestion, suggestion); assert.equal(calls, 1);
});
test("잘못된 이미지, 크기, MIME은 외부 호출 전에 거부", async () => {
  let calls = 0; const handler = createAnalyzeHandler({ getConfig: () => config, fetcher: async () => { calls++; return upstream({}); } });
  assert.equal((await handler(request({ image: "data:image/png;base64,YWJj" }))).status, 400);
  assert.equal((await handler(request({ image: "data:image/svg+xml;base64,PHN2Zz4=" }))).status, 400);
  assert.equal((await handler(request({ image: `data:image/png;base64,${"A".repeat(500000)}` }))).status, 413);
  assert.equal(calls, 0);
});
test("키·모델 누락, 기능 비활성화와 프로덕션 환경에서 수동 등록으로 대체", async () => {
  for (const overrides of [{ apiKey: "" }, { model: "" }, { enabled: "false" }, { nodeEnv: "production" }, { vercel: "1" }]) {
    let calls = 0; const handler = createAnalyzeHandler({ getConfig: () => ({ ...config, ...overrides }), fetcher: async () => { calls++; return upstream({}); } });
    const res = await handler(request({ image })); assert.equal(res.status, 503); assert.match((await res.json()).error, /직접 입력/); assert.equal(calls, 0);
  }
});
test("잘못된 구조, 허용되지 않은 카테고리, 실패 응답과 네트워크 오류는 안전하게 안내", async () => {
  const bodies = [output({ ...suggestion, category: "임의 카테고리" }), output({ ...suggestion, itemName: "", extra: "x" }), { status: "incomplete", output: [] }, { status: "completed", output: [{ content: [{ type: "refusal", refusal: "no" }] }] }, output("not valid")];
  for (const body of bodies) { const handler = createAnalyzeHandler({ getConfig: () => config, fetcher: async () => upstream(body) }); const res = await handler(request({ image })); assert.equal(res.status, 502); assert.match((await res.json()).error, /직접 입력/); }
  const handler = createAnalyzeHandler({ getConfig: () => config, fetcher: async () => { throw new Error("secret network detail"); } });
  const res = await handler(request({ image })); assert.equal(res.status, 502); assert.doesNotMatch(JSON.stringify(await res.json()), /secret/);
  const serverFailure = createAnalyzeHandler({ getConfig: () => config, fetcher: async () => upstream({}, 500) }); assert.equal((await serverFailure(request({ image }))).status, 502);
});
test("타임아웃 및 개발용 요청 제한은 추가 호출을 막는다", async () => {
  const slow = createAnalyzeHandler({ getConfig: () => config, fetcher: async () => new Promise<Response>(() => {}), timeoutMs: 5 }); assert.equal((await slow(request({ image }))).status, 502);
  let calls = 0; const limited = createAnalyzeHandler({ getConfig: () => config, now: () => 1000, fetcher: async () => { calls++; return upstream(output(suggestion)); } });
  for (let i=0; i<3; i++) assert.equal((await limited(request({ image }))).status, 200);
  assert.equal((await limited(request({ image }))).status, 429); assert.equal(calls, 3);
});
test("사용자가 수정한 제안만 명시적으로 적용하며 나머지 수동 입력 보존", () => {
  const form = { title: "사용자 품목", category: "기타", description: "수동 설명", askingPrice: "123" };
  const edited = { ...suggestion, itemName: "  수정한 장비  ", category: "사무·전자" as const, visibleFeatures: [...suggestion.visibleFeatures], checksNeeded: [...suggestion.checksNeeded] };
  assert.equal(isAnalysisSuggestion(edited), true);
  assert.deepEqual(applySuggestion(form, edited), { ...form, title: "수정한 장비", category: "사무·전자" });
  assert.deepEqual(applySuggestion(form, { ...edited, itemName: "확인 필요", category: "확인 필요" }), form);
});
