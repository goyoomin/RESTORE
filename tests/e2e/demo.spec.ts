import { test, expect } from "@playwright/test";
import sharp from "sharp";

function dateAfter(days: number): string { const date = new Date(); date.setDate(date.getDate() + days); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

test("폐업자 등록 → 창업자 검색과 매칭 → 가상 완료와 대시보드 초기화", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "내 자산 등록하기" }).first().click();
  await expect(page).toHaveURL(/\/sell\/new$/);
  await page.locator("#photo-input").setInputFiles({ name: "wrong.txt", mimeType: "text/plain", buffer: Buffer.from("wrong") });
  await expect(page.getByText("JPG, PNG 또는 WebP 사진을 선택해 주세요.")).toBeVisible();
  const photo = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#164b3c" } }).png().toBuffer();
  await page.locator("#photo-input").setInputFiles({ name: "demo.png", mimeType: "image/png", buffer: photo });
  await expect(page.getByAltText("선택한 장비 사진")).toBeVisible();
  await page.getByRole("button", { name: "AI로 품목 확인" }).click();
  await expect(page.getByText("AI 분석을 사용할 수 없습니다. 직접 입력해 주세요.")).toBeVisible();
  await page.getByRole("button", { name: "직접 입력하기" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await expect(page.getByText("장비 이름을 입력해 주세요.")).toBeVisible();
  await page.locator("#field-title").fill("발표 시연 테스트 장비");
  await page.locator("#field-category").selectOption({ label: "주방·카페" });
  await page.locator("#field-condition").selectOption({ label: "일반 중고" });
  await page.locator("#field-askingPrice").fill("500000");
  await page.locator("#field-disposalDeadline").fill(dateAfter(30));
  await page.locator("#field-district").selectOption({ label: "수원시" });
  await page.locator("#field-description").fill("시연용 장비 설명");
  await page.getByRole("button", { name: "다음" }).click();
  await expect(page.getByRole("heading", { name: "입력한 내용을 확인해 주세요" })).toBeVisible();
  await page.getByRole("button", { name: "등록 완료하기" }).click();
  await expect(page.getByRole("heading", { name: "자산 등록이 완료됐어요" })).toBeVisible();
  await page.getByRole("link", { name: "장비 목록 둘러보기" }).click();
  await page.locator("#market-search").fill("발표 시연 테스트");
  await page.locator("#filter-category").selectOption({ label: "주방·카페" });
  await expect(page.getByRole("heading", { name: "발표 시연 테스트 장비" })).toBeVisible();
  await page.reload();
  await page.locator("#market-search").fill("발표 시연 테스트");
  await page.getByRole("link", { name: "발표 시연 테스트 장비 상세 보기" }).first().click();
  await expect(page).toHaveURL(/\/market\/[^/]+$/);
  await expect(page.locator(".detail-summary").getByRole("heading", { name: "발표 시연 테스트 장비" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "다시 쓰일 장비들" })).toBeVisible();
  await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "스마트 매칭" }).click();
  await page.locator("#need-category").selectOption({ label: "주방·카페" });
  await page.locator("#need-budget").fill("1000000");
  await page.locator("#need-city").selectOption({ label: "수원시" });
  await page.locator("#need-pickup").fill(dateAfter(5));
  await page.getByRole("button", { name: "조건에 맞는 장비 찾기" }).click();
  const match = page.locator(".match-card").filter({ hasText: "발표 시연 테스트 장비" });
  await expect(match).toBeVisible();
  await expect(match.locator(".match-score strong")).toHaveText("100");
  await match.getByRole("link", { name: "장비 상세 보기" }).click();
  await page.getByRole("button", { name: "거래 시뮬레이션 시작" }).click();
  await page.locator("#sim-seller").fill("10000");
  await page.locator("#sim-shipping").fill("20000");
  await page.locator("#sim-reference").fill("800000");
  await page.getByRole("button", { name: "취소", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("restore-demo-v1")!).transactions.length)).toBe(0);
  await page.getByRole("button", { name: "거래 시뮬레이션 시작" }).click();
  await expect(page.locator("#sim-reference")).toHaveValue("800000");
  await page.getByRole("button", { name: "입력 내용 확인" }).click();
  await page.getByRole("button", { name: "가상 완료 확정" }).click();
  await expect(page.getByText("가상 거래 완료 사례가 저장되었습니다.")).toBeVisible();
  await page.getByRole("link", { name: "가상 정책 효과 확인" }).click();
  await expect(page.locator(".impact-metrics article").filter({ hasText: "가상 완료 거래 수" })).toContainText("1건");
  await expect(page.locator(".impact-metrics article").filter({ hasText: "판매자 순회수액" })).toContainText("490,000원");
  await expect(page.locator(".impact-metrics article").filter({ hasText: "구매자 구매비 절감액" })).toContainText("280,000원");
  await page.reload();
  await expect(page.locator(".impact-metrics article").filter({ hasText: "가상 완료 거래 수" })).toContainText("1건");
  await page.goBack();
  await page.reload();
  await expect(page.getByText("이미 가상 완료 처리된 장비입니다.")).toBeVisible();
  await expect(page.getByRole("button", { name: "거래 시뮬레이션 시작" })).toHaveCount(0);
  await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "정책 효과" }).click();
  await expect(page.locator(".impact-metrics article").filter({ hasText: "가상 완료 거래 수" })).toContainText("1건");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "시연 데이터 초기화" }).click();
  await expect(page.locator(".impact-metrics article").filter({ hasText: "가상 완료 거래 수" })).toContainText("0건");
});

test("없는 ID, 손상된 저장값과 빈 검색 결과를 안내한다", async ({ page }) => {
  const invalidPage = await page.goto("/invalid-route-example");
  expect(invalidPage?.status()).toBe(404);
  await page.goto("/market/does-not-exist");
  await expect(page.getByRole("heading", { name: "장비를 찾을 수 없어요" })).toBeVisible();
  await page.goto("/market");
  await expect(page.locator(".market-card").first()).toBeVisible();
  await page.evaluate(() => { const data = JSON.parse(localStorage.getItem("restore-demo-v1")!); data.assets[0].disposalDeadline = "2000-01-01"; localStorage.setItem("restore-demo-v1", JSON.stringify(data)); });
  await page.reload();
  await expect(page.locator(".market-card").filter({ hasText: "업소용 커피머신" })).toContainText("처분 기한 지남");
  await page.locator("#market-search").fill("없는 시연 장비 zzz");
  await expect(page.getByText("조건에 맞는 장비가 아직 없어요.")).toBeVisible();
  await page.evaluate(() => localStorage.setItem("restore-demo-v1", "{invalid"));
  await page.reload();
  await expect(page.getByText(/저장된 데이터의 형식이 올바르지 않습니다/)).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "초기 데이터로 되돌리기" }).click();
  await expect(page.getByRole("heading", { name: "다시 쓰일 장비들" })).toBeVisible();
});

test("모바일 메뉴 및 주요 화면은 360px에서 가로로 넘치지 않는다", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ["/", "/sell/new", "/market", "/match", "/impact", "/policy"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  }
  await page.goto("/market");
  await expect(page.locator(".market-filters")).not.toHaveAttribute("open", "");
  await page.locator(".market-filters summary").click();
  await expect(page.locator(".market-filters")).toHaveAttribute("open", "");
  await page.goto("/");
  await page.getByLabel("메뉴", { exact: true }).focus();
  await expect(page.getByLabel("메뉴", { exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("navigation", { name: "모바일 메뉴" }).getByRole("link", { name: "장비 둘러보기" }).click();
  await expect(page).toHaveURL(/\/market$/);
  await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open", "");
});

test("주요 화면의 WCAG 자동 접근성 점검", async ({ page }) => {
  for (const path of ["/", "/sell/new", "/market", "/market/seed-coffee", "/match", "/impact", "/policy"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    if (path === "/sell/new") { await page.getByRole("button", { name: "다음" }).click(); await page.getByRole("button", { name: "다음" }).click(); await expect(page.getByText("장비 이름을 입력해 주세요.")).toBeVisible(); }
    if (path === "/market/seed-coffee") await expect(page.locator(".detail-summary h1")).toBeVisible();
    if (path === "/market") await expect(page.locator(".market-card").first()).toBeVisible();
    await page.locator(".demo-guide summary").click();
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const violations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: (node: Document, options: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
      return (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
    });
    expect(violations, `${path} accessibility violations: ${JSON.stringify(violations)}`).toEqual([]);
  }
});

test("메인에서 창업자 검색·관심 표시·매칭으로 이동", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "필요한 장비 찾기" }).first().click();
  await expect(page.locator(".market-card").first()).toBeVisible();
  await page.evaluate(deadline => { const data = JSON.parse(localStorage.getItem("restore-demo-v1")!); data.assets.find((a: { id: string }) => a.id === "seed-coffee").disposalDeadline = deadline; localStorage.setItem("restore-demo-v1", JSON.stringify(data)); }, dateAfter(30));
  await page.reload();
  await page.locator("#market-search").fill("커피머신");
  await page.locator("#filter-district").selectOption({ label: "수원시" });
  await page.locator("#filter-availability").selectOption({ label: "거래 가능" });
  const card = page.locator(".market-card").filter({ hasText: "업소용 커피머신" });
  await expect(card).toBeVisible();
  await card.getByRole("link", { name: "업소용 커피머신 상세 보기" }).first().click();
  await expect(page.locator(".detail-summary h1")).toHaveText("업소용 커피머신");
  await page.getByRole("button", { name: "업소용 커피머신 관심 추가" }).click();
  await expect(page.getByRole("button", { name: "업소용 커피머신 관심 해제" })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "업소용 커피머신 관심 해제" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "스마트 매칭" }).click();
  await page.locator("#need-category").selectOption({ label: "주방·카페" });
  await page.locator("#need-budget").fill("1500000");
  await page.locator("#need-city").selectOption({ label: "수원시" });
  await page.locator("#need-pickup").fill(dateAfter(5));
  await page.getByRole("button", { name: "조건에 맞는 장비 찾기" }).click();
  await expect(page.locator(".match-card").filter({ hasText: "업소용 커피머신" })).toBeVisible();
});

test("태블릿과 데스크톱에서도 주요 화면이 넘치지 않는다", async ({ page }) => {
  for (const width of [768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/sell/new", "/market", "/match", "/impact", "/policy"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px ${path}`).toBeTruthy();
    }
  }
});

test("시연 안내의 빠른 이동과 초기화는 확인 후에만 적용된다", async ({ page }) => {
  await page.goto("/market");
  await expect(page.locator(".market-card").first()).toBeVisible();
  await page.evaluate(() => { const data = JSON.parse(localStorage.getItem("restore-demo-v1")!); data.assets.push({ ...data.assets[0], id: "demo-extra", title: "초기화 확인 장비", dataOrigin: "user" }); localStorage.setItem("restore-demo-v1", JSON.stringify(data)); });
  await page.reload();
  await page.locator(".demo-guide summary").click();
  await expect(page.getByRole("navigation", { name: "시연 순서" }).getByRole("link", { name: "1. 폐업자: 장비 등록" })).toBeVisible();
  page.once("dialog", dialog => dialog.dismiss());
  await page.locator(".demo-guide").getByRole("button", { name: "시연 데이터 초기화", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("restore-demo-v1")!).assets.length)).toBe(9);
  page.once("dialog", dialog => dialog.accept());
  await page.locator(".demo-guide").getByRole("button", { name: "시연 데이터 초기화", exact: true }).click();
  await expect(page.getByText("이 브라우저의 시연 데이터를 초기 상태로 되돌렸습니다.")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("restore-demo-v1")!).assets.length)).toBe(8);
  await page.getByRole("navigation", { name: "시연 순서" }).getByRole("link", { name: "3. 창업 조건과 추천" }).click();
  await expect(page).toHaveURL(/\/match$/);
});

test("주요 화면 이동 중 클라이언트 콘솔 오류가 없다", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  for (const path of ["/", "/sell/new", "/market", "/market/seed-coffee", "/match", "/impact", "/policy"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
