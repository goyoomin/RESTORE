import test from "node:test";
import assert from "node:assert/strict";
import { calculateMatchScore, rankMatches } from "../lib/matching/match.ts";
import { createSeedStore } from "../lib/data/seed.ts";
import type { Asset, BuyerNeed, DemoTransaction } from "../lib/domain/models.ts";
import { createDemoRepository, type StoragePort } from "../lib/repositories/demo-repository.ts";
import { calculateImpact, validAmount } from "../lib/simulation/impact.ts";
const asset: Asset = { ...createSeedStore().assets[0], askingPrice: 600, district: "수원시", neighborhood: "인계동", disposalDeadline: "2027-04-20", status: "AVAILABLE" };
const need: BuyerNeed = { id: "need", category: asset.category, maxBudget: 1000, preferredRegion: "경기도", preferredDistrict: "수원시", preferredNeighborhood: "인계동", desiredPickupDate: "2027-04-10", createdAt: "2027-04-01" };
const today = "2027-04-01";
test("카테고리 불일치, 예산 초과, 날짜 초과, 만료 및 비가용 자산 제외", () => {
  assert.equal(calculateMatchScore({ ...asset, category: "기타" }, need, today), null);
  assert.equal(calculateMatchScore({ ...asset, askingPrice: 1001 }, need, today), null);
  assert.equal(calculateMatchScore({ ...asset, disposalDeadline: "2027-04-09" }, need, today), null);
  assert.equal(calculateMatchScore({ ...asset, disposalDeadline: "2027-03-31" }, need, today), null);
  assert.equal(calculateMatchScore({ ...asset, status: "RESERVED" }, need, today), null);
  assert.equal(calculateMatchScore({ ...asset, status: "COMPLETED" }, need, today), null);
  assert.equal(calculateMatchScore(asset, { ...need, desiredPickupDate: "2027-02-29" }, today), null);
});
test("지역 점수와 세부 지역 미입력 처리 및 추천 이유", () => {
  const exact = calculateMatchScore(asset, need, today)!;
  const city = calculateMatchScore({ ...asset, neighborhood: "다른동" }, need, today)!;
  const other = calculateMatchScore({ ...asset, district: "용인시" }, need, today)!;
  const noDetail = calculateMatchScore({ ...asset, neighborhood: undefined }, { ...need, preferredNeighborhood: undefined }, today)!;
  assert.equal(exact.points.location, 25); assert.equal(city.points.location, 18); assert.equal(other.points.location, 8); assert.equal(noDetail.points.location, 25);
  assert.match(exact.reasons[2], /같은 시·군과 세부 지역/); assert.match(city.reasons[2], /다르거나 등록되지/); assert.match(other.reasons[2], /다르지만/); assert.match(noDetail.reasons[2], /미입력/);
});
test("예산 비율과 일정 경계값 및 사유 일치", () => {
  for (const [amount, expected] of [[600,25],[601,20],[800,20],[801,15],[1000,15]]) { const result = calculateMatchScore({ ...asset, askingPrice: amount }, need, today)!; assert.equal(result.points.price, expected); assert.match(result.reasons[1], new RegExp(`${expected}점`)); }
  for (const [deadline, expected, days] of [["2027-04-17",10,7],["2027-04-16",7,6],["2027-04-13",7,3],["2027-04-12",5,2],["2027-04-10",5,0]] as const) { const result = calculateMatchScore({ ...asset, disposalDeadline: deadline }, need, today)!; assert.equal(result.points.schedule, expected); assert.match(result.reasons[3], new RegExp(`${days}일 전`)); assert.equal(result.score, Object.values(result.points).reduce((a,b) => a+b,0)); }
});
test("추천은 실제 점수 내림차순", () => {
  const list = rankMatches([{ ...asset, id: "low", askingPrice: 1000, district: "화성시" }, { ...asset, id: "high" }, { ...asset, id: "mid", askingPrice: 800 }], need, today);
  assert.deepEqual(list.map(result => result.asset.id), ["high", "mid", "low"]);
  assert.ok(list.every((result, i) => i === 0 || list[i-1].score >= result.score));
});
test("가상 완료는 단일 기록으로 저장되고 중복과 취소 없는 변경을 방지", () => {
  const map = new Map<string,string>(); const storage: StoragePort = { getItem: key => map.get(key) ?? null, setItem: (key,value) => { map.set(key,value); } }; const repo = createDemoRepository(storage);
  const before = repo.load(); const transaction: DemoTransaction = { id: "txn", assetId: before.assets[0].id, transactionPrice: 100, sellerCost: 10, buyerShippingCost: 20, referenceNewPrice: 300, completedAt: "2026-11-08", simulated: true };
  assert.deepEqual(repo.load(), before); // 확인 취소는 저장소를 호출하지 않는다.
  const done = repo.completeTransaction(transaction); assert.equal(done.assets[0].status, "COMPLETED"); assert.equal(done.transactions.length, 1); assert.throws(() => repo.completeTransaction({ ...transaction, id: "txn2" }));
  assert.deepEqual(createDemoRepository(storage).load(), done);
  const stats = calculateImpact(done.transactions); assert.equal(stats.transactionTotal, 100n); assert.equal(stats.sellerNet, 90n); assert.equal(stats.estimatedSavings, 180n); assert.equal(stats.comparableCount, 1); assert.equal(stats.unavailableCount, 0);
  assert.equal(calculateImpact([{ ...transaction, referenceNewPrice: undefined }]).unavailableCount, 1);
  for (const invalid of ["", "-1", "1.2", "1e3"]) assert.equal(validAmount(invalid), false);
});
