import test from "node:test";
import assert from "node:assert/strict";
import { createSeedStore } from "../lib/data/seed.ts";
import type { DemoTransaction } from "../lib/domain/models.ts";
import { buyerDifference, calculateImpact, calculateScenario } from "../lib/simulation/impact.ts";
import { createDemoRepository, type StoragePort } from "../lib/repositories/demo-repository.ts";

const example: DemoTransaction = { id: "tx1", assetId: "seed-coffee", transactionPrice: 100, sellerCost: 20, buyerShippingCost: 30, referenceNewPrice: 200, completedAt: "2026-11-08", simulated: true };
test("거래 없는 경우 금액은 0, 비교 가능 건수는 0", () => {
 const stats = calculateImpact([], createSeedStore().assets); assert.equal(stats.count, 0); assert.equal(stats.transactionTotal, 0n); assert.equal(stats.sellerNet, 0n); assert.equal(stats.comparableCount, 0); assert.equal(stats.unavailableCount, 0);
});
test("운송비 차감, 누락 기준가, 음수 차액은 명확히 계산", () => {
 assert.equal(buyerDifference(example), 70n);
 assert.equal(buyerDifference({ ...example, referenceNewPrice: undefined }), null);
 assert.equal(buyerDifference({ ...example, referenceNewPrice: 110 }), -20n);
 assert.equal(calculateImpact([{ ...example, sellerCost: 130 }]).sellerNet, -30n);
 const stats = calculateImpact([example, { ...example, id: "tx2", assetId: "seed-fridge", referenceNewPrice: 110 }, { ...example, id: "tx3", assetId: "seed-ice", referenceNewPrice: undefined }]);
 assert.equal(stats.count, 3); assert.equal(stats.transactionTotal, 300n); assert.equal(stats.sellerNet, 240n); assert.equal(stats.estimatedSavings, 50n); assert.equal(stats.negativeSavingsCount, 1); assert.equal(stats.comparableCount, 2); assert.equal(stats.unavailableCount, 1);
});
test("중복, 비시연 및 완료 상태가 아닌 기록은 집계하지 않는다", () => {
 const assets = createSeedStore().assets.map(a => a.id === example.assetId ? { ...a, status: "COMPLETED" as const } : a);
 const duplicates = [example, { ...example, id: "different" }, { ...example, assetId: "seed-fridge" }, { ...example, id: "tx2", assetId: "seed-ice", simulated: false } as unknown as DemoTransaction];
 assert.equal(calculateImpact(duplicates, assets).count, 1);
 assert.equal(calculateImpact([example], createSeedStore().assets).count, 0);
});
test("완료 직후 집계되고 초기화 후 다시 0으로 돌아온다", () => {
 const map = new Map<string,string>(); const storage: StoragePort = { getItem: key => map.get(key) ?? null, setItem: (key,value) => { map.set(key,value); } };
 const repo = createDemoRepository(storage); const complete = repo.completeTransaction(example, example.completedAt); assert.equal(calculateImpact(complete.transactions, complete.assets).count, 1);
 assert.throws(() => repo.completeTransaction({ ...example, id: "again" }, example.completedAt)); const reset = repo.reset(); assert.equal(calculateImpact(reset.transactions, reset.assets).count, 0); assert.equal(reset.assets.length, 8);
});
test("시범사업 계산기는 입력 변경·0·유효하지 않은 값과 큰 정수를 정확히 처리", () => {
 const base = { shops: "10", transactionsPerShop: "2", recoveryPerTransaction: "100", savingsPerTransaction: "50" };
 assert.deepEqual(calculateScenario(base), { count: 20n, recovery: 2000n, savings: 1000n });
 assert.equal(calculateScenario({ ...base, shops: "3" })?.count, 6n);
 assert.equal(calculateScenario({ ...base, shops: "0" })?.recovery, 0n);
 for (const value of ["", "-1", "1.1", "abc", "1000000000000000"]) assert.equal(calculateScenario({ ...base, shops: value }), null);
 assert.equal(calculateScenario({ ...base, shops: "999999999999999", transactionsPerShop: "999999999999999" })?.count, 999999999999998000000000000001n);
});
