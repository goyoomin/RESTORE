import test from "node:test";
import assert from "node:assert/strict";
import { createSeedStore } from "../lib/data/seed.ts";
import type { DemoTransaction } from "../lib/domain/models.ts";
import { transactionConditionError } from "../lib/simulation/transaction.ts";

const today = "2026-11-09";
const store = createSeedStore(today);
const asset = store.assets.find(item => item.id === "seed-coffee")!;
const need = store.buyerNeeds.find(item => item.id === "need-coffee")!;
const transaction: DemoTransaction = { id: "pending", assetId: asset.id, buyerNeedId: need.id, transactionPrice: 1_000_000, sellerCost: 0, buyerShippingCost: 100_000, completedAt: today, simulated: true };

test("매칭 구매 조건의 품목, 가격+운송비 예산과 인수 일정을 완료 시 다시 검증한다", () => {
  assert.equal(transactionConditionError(asset, transaction, need, today), null);
  assert.match(transactionConditionError(asset, { ...transaction, transactionPrice: 1_100_000, buyerShippingCost: 500_000 }, need, today) ?? "", /예산/);
  assert.match(transactionConditionError(asset, { ...transaction, buyerShippingCost: 600_000 }, need, today) ?? "", /예산/);
  assert.match(transactionConditionError(asset, transaction, { ...need, itemType: "가스레인지" }, today) ?? "", /품목/);
  assert.match(transactionConditionError({ ...asset, itemType: undefined }, transaction, need, today) ?? "", /품목/);
  assert.match(transactionConditionError(asset, transaction, { ...need, itemType: undefined }, today) ?? "", /품목/);
  assert.match(transactionConditionError(asset, transaction, { ...need, desiredPickupDate: "2026-11-08" }, today) ?? "", /인수 희망일/);
  assert.match(transactionConditionError(asset, transaction, { ...need, desiredPickupDate: "2027-02-01" }, today) ?? "", /인수 희망일/);
});

test("완료 상품, 만료 자산, 등록 희망가 초과와 오래된 완료일을 거부한다", () => {
  assert.match(transactionConditionError({ ...asset, status: "COMPLETED" }, transaction, need, today) ?? "", /거래 가능한 상태/);
  assert.match(transactionConditionError(asset, { ...transaction, completedAt: "2027-02-01" }, undefined, "2027-02-01") ?? "", /처분 기한/);
  assert.match(transactionConditionError(asset, { ...transaction, transactionPrice: asset.askingPrice + 1, buyerNeedId: undefined }, undefined, today) ?? "", /희망 가격/);
  assert.match(transactionConditionError(asset, { ...transaction, completedAt: "2026-11-08" }, need, today) ?? "", /오늘 날짜/);
});

test("초기 시연 기한은 생성 날짜에 따라 갱신되고 모든 새 자산은 만료 전이다", () => {
  const fresh = createSeedStore("2030-01-01");
  assert.ok(fresh.assets.every(item => item.disposalDeadline > "2030-01-01"));
  assert.equal(fresh.assets.find(item => item.id === "seed-coffee")?.disposalDeadline, "2030-03-17");
  assert.equal(fresh.buyerNeeds.find(item => item.id === "need-coffee")?.desiredPickupDate, "2030-02-15");
});
