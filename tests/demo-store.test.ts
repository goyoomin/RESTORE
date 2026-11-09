import test from "node:test";
import assert from "node:assert/strict";
import { createDemoRepository, DemoStorageError, STORAGE_KEY, type StoragePort } from "../lib/repositories/demo-repository.ts";
import { isAsset, isDate, isDemoStore, isDemoTransaction } from "../lib/domain/validation.ts";
import type { Asset, DemoTransaction } from "../lib/domain/models.ts";

function memoryStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(STORAGE_KEY, initial);
  const storage: StoragePort = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  return { storage, values };
}
const userAsset: Asset = { id: "user-1", title: "시연 책상", category: "사무·전자", description: "사용자 데모", condition: "양호", askingPrice: 10000, region: "경기도", district: "수원시", disposalDeadline: "2027-04-01", status: "AVAILABLE", image: "desk", createdAt: "2026-11-08", dataOrigin: "user" };

test("첫 방문 시 시드 생성, 재로드 시 저장값 유지, 추가와 상태 변경, 초기화", () => {
  const { storage } = memoryStorage();
  const repo = createDemoRepository(storage);
  const first = repo.load();
  assert.equal(first.assets.length, 8);
  assert.equal(first.buyerNeeds.length, 3);
  assert.equal(first.transactions.length, 0);
  assert.equal(first.assets.every(asset => asset.dataOrigin === "seed"), true);
  assert.equal(repo.addAsset(userAsset).assets.length, 9);
  assert.equal(repo.setAssetStatus(userAsset.id, "RESERVED").assets.at(-1)?.status, "RESERVED");
  const reloaded = createDemoRepository(storage).load();
  assert.equal(reloaded.assets.at(-1)?.dataOrigin, "user");
  assert.equal(reloaded.assets.at(-1)?.status, "RESERVED");
  assert.deepEqual(repo.reset(), first);
  assert.deepEqual(createDemoRepository(storage).load(), first);
});

test("잘못된 저장값은 덮어쓰지 않고 오류를 반환하며 명시적 초기화로 복구", () => {
  for (const invalid of ["{broken", JSON.stringify({ schemaVersion: 2, assets: [], buyerNeeds: [], transactions: [] }), JSON.stringify({ schemaVersion: 1, assets: [userAsset, userAsset], buyerNeeds: [], transactions: [] })]) {
    const { storage, values } = memoryStorage(invalid);
    const repo = createDemoRepository(storage);
    assert.throws(() => repo.load(), (e: unknown) => e instanceof DemoStorageError && e.reason === "invalid");
    assert.equal(values.get(STORAGE_KEY), invalid);
    assert.equal(repo.reset().assets.length, 8);
    assert.equal(isDemoStore(repo.load()), true);
  }
});

test("금액과 날짜, 가상 거래 및 참조 무결성 검증", () => {
  assert.equal(isDate("2024-02-29"), true);
  for (const date of ["2025-02-29", "2026-2-01", "2026-13-01", "2026-04-31"]) assert.equal(isDate(date), false);
  assert.equal(isAsset({ ...userAsset, askingPrice: -1 }), false);
  assert.equal(isAsset({ ...userAsset, askingPrice: 1.5 }), false);
  assert.equal(isAsset({ ...userAsset, createdAt: "2026-02-30" }), false);
  const transaction: DemoTransaction = { id: "tx-1", assetId: "seed-coffee", buyerNeedId: "need-coffee", transactionPrice: 1000000, sellerCost: 0, buyerShippingCost: 30000, completedAt: "2026-11-08", simulated: true };
  assert.equal(isDemoTransaction({ ...transaction, simulated: false }), false);
  const { storage } = memoryStorage();
  const repo = createDemoRepository(storage);
  const complete = repo.completeTransaction(transaction);
  assert.equal(complete.assets.find(item => item.id === transaction.assetId)?.status, "COMPLETED");
  assert.equal(complete.transactions[0].simulated, true);
  assert.throws(() => repo.completeTransaction({ ...transaction, id: "tx-2" }), DemoStorageError);
  assert.throws(() => repo.setAssetStatus(transaction.assetId, "AVAILABLE"), DemoStorageError);
  assert.equal(isDemoStore({ ...complete, transactions: [{ ...transaction, buyerNeedId: "missing" }] }), false);
});

test("저장소 접근 또는 쓰기 실패를 사용자에게 알릴 수 있는 오류로 반환", () => {
  const blocked: StoragePort = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.throws(() => createDemoRepository(blocked).load(), (e: unknown) => e instanceof DemoStorageError && e.reason === "unavailable");
  const full: StoragePort = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
  assert.throws(() => createDemoRepository(full).load(), (e: unknown) => e instanceof DemoStorageError && e.reason === "unavailable");
});
