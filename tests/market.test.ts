import test from "node:test";
import assert from "node:assert/strict";
import { createSeedStore } from "../lib/data/seed.ts";
import { availability, daysUntil, emptyFilters, filterAssets, priceError, redactContacts } from "../lib/market/filters.ts";
import { createDemoRepository, STORAGE_KEY, type StoragePort } from "../lib/repositories/demo-repository.ts";
import { toAsset, emptyForm } from "../lib/registration/form.ts";

const today = "2027-03-01";
const assets = createSeedStore("2026-12-31").assets;
const filters = emptyFilters();
test("장비명·카테고리·설명 검색과 복합 필터, 빈 결과", () => {
  assert.equal(filterAssets(assets, { ...filters, query: "커피머신" }, today)[0].id, "seed-coffee");
  assert.deepEqual(filterAssets(assets, { ...filters, query: "냉장·냉동" }, today).map(a => a.id).sort(), ["seed-fridge", "seed-ice"]);
  assert.equal(filterAssets(assets, { ...filters, query: "베이커리" }, today)[0].id, "seed-showcase");
  assert.deepEqual(filterAssets(assets, { ...filters, category: "냉장·냉동", district: "고양시", condition: "양호", minPrice: "400000", maxPrice: "500000", availability: "AVAILABLE" }, today).map(a => a.id), ["seed-ice"]);
  assert.equal(filterAssets(assets, { ...filters, query: "없는 물품" }, today).length, 0);
  assert.ok(priceError({ ...filters, minPrice: "100", maxPrice: "10" }));
  assert.ok(priceError({ ...filters, minPrice: "1.5" }));
});
test("기한 당일은 거래 가능, 지난 장비는 기한 지남으로 표시 및 필터링", () => {
  const ice = assets.find(a => a.id === "seed-ice")!;
  assert.equal(availability(ice, today), "AVAILABLE");
  assert.equal(daysUntil(ice.disposalDeadline, today), 0);
  assert.equal(availability(ice, "2027-03-02"), "EXPIRED");
  assert.equal(availability({ ...ice, status: "RESERVED" }, "2027-03-02"), "EXPIRED");
  assert.equal(availability({ ...ice, status: "COMPLETED" }, "2027-03-02"), "COMPLETED");
  assert.equal(filterAssets([ice], { ...filters, availability: "AVAILABLE" }, "2027-03-02").length, 0);
});
test("가격·최신·기한 정렬은 예상한 순서이며 기한 경과는 뒤에 배치", () => {
  const newest = filterAssets(assets, filters, today);
  assert.equal(newest[0].id, "seed-stove");
  const low = filterAssets(assets, { ...filters, sort: "price-low" }, today);
  const high = filterAssets(assets, { ...filters, sort: "price-high" }, today);
  assert.equal(low[0].id, "seed-desk"); assert.equal(high[0].id, "seed-coffee");
  const deadlines = filterAssets(assets, { ...filters, sort: "deadline" }, today);
  assert.equal(deadlines[0].id, "seed-ice");
  const expired = { ...assets[0], id: "expired-test", disposalDeadline: "2027-02-28" };
  const withExpired = filterAssets([...assets, expired], { ...filters, sort: "deadline" }, today);
  assert.equal(withExpired.at(-1)?.id, "expired-test");
});
test("관심 추가·해제와 등록 자산은 저장소 재조회 후 유지된다", () => {
  const values = new Map<string, string>(); const storage: StoragePort = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  const repo = createDemoRepository(storage); const old = repo.load(); assert.equal(old.favoriteIds, undefined);
  const asset = toAsset({ ...emptyForm(), title: "내 장비", category: "기타", itemType: "기타 장비", condition: "일반 중고", askingPrice: "1000", district: "수원시", disposalDeadline: "2027-04-01" }, "my-item", "2026-11-08");
  repo.addAsset(asset); repo.toggleFavorite(asset.id);
  const reloaded = createDemoRepository(storage).load(); assert.equal(reloaded.assets.find(a => a.id === asset.id)?.title, "내 장비"); assert.deepEqual(reloaded.favoriteIds, [asset.id]);
  repo.toggleFavorite(asset.id); assert.deepEqual(createDemoRepository(storage).load().favoriteIds, []);
  assert.ok(values.has(STORAGE_KEY)); assert.throws(() => repo.toggleFavorite("missing"));
});
test("표시 텍스트의 일반적인 연락처를 가린다", () => { assert.equal(redactContacts("전화 010-1234-5678, test@example.com"), "전화 [연락처 비공개], [이메일 비공개]"); });
