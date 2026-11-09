import test from "node:test";
import assert from "node:assert/strict";
import { emptyForm, toAsset, validateForm } from "../lib/registration/form.ts";
import { createDemoRepository, DemoStorageError, type StoragePort } from "../lib/repositories/demo-repository.ts";

const valid = { ...emptyForm(), title: "  시연 커피머신  ", category: "주방·카페", condition: "일반 중고", askingPrice: "300000", district: "수원시", disposalDeadline: "2027-04-01" };
test("필수 항목·공백·금액·날짜를 검증한다", () => {
  assert.deepEqual(Object.keys(validateForm(emptyForm())).sort(), ["askingPrice", "category", "condition", "disposalDeadline", "district", "title"].sort());
  assert.ok(validateForm({ ...valid, title: "   " }).title);
  for (const askingPrice of ["0", "-1", "1.2", "1e3", "9007199254740992"]) assert.ok(validateForm({ ...valid, askingPrice }).askingPrice);
  assert.ok(validateForm({ ...valid, disposalDeadline: "2027-02-29" }).disposalDeadline);
  assert.ok(validateForm({ ...valid, title: "가".repeat(61) }).title);
  assert.deepEqual(validateForm(valid), {});
});
test("사진과 설명 없이 등록하고 새 저장소 인스턴스에서도 유지된다", () => {
  const values = new Map<string, string>();
  const storage: StoragePort = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  const asset = toAsset(valid, "user-test", "2026-11-08");
  assert.equal(asset.image, "package");
  assert.equal(asset.description, "");
  assert.equal(asset.title, "시연 커피머신");
  createDemoRepository(storage).addAsset(asset);
  assert.deepEqual(createDemoRepository(storage).load().assets.find(item => item.id === asset.id), asset);
});
test("사진 데이터가 포함된 쓰기 실패는 기존 저장 데이터를 보존한다", () => {
  const values = new Map<string, string>(); let fail = false;
  const storage: StoragePort = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (fail) throw new Error("quota"); values.set(key, value); } };
  const repository = createDemoRepository(storage); const original = repository.load(); fail = true;
  const withImage = toAsset({ ...valid, image: "data:image/jpeg;base64,dGVzdA==" }, "image-test", "2026-11-08");
  assert.throws(() => repository.addAsset(withImage), (e: unknown) => e instanceof DemoStorageError && e.reason === "unavailable");
  assert.deepEqual(repository.load(), original);
  assert.equal(withImage.image, "data:image/jpeg;base64,dGVzdA==");
});
