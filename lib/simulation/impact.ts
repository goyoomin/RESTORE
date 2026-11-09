import type { Asset, DemoTransaction } from "../domain/models.ts";
import { isDemoTransaction } from "../domain/validation.ts";

// A completed simulation is represented by one valid transaction for a completed asset.
// Keep the first record for each asset/transaction ID even if an untrusted caller passes duplicates.
export function completedTransactions(transactions: DemoTransaction[], assets?: Asset[]): DemoTransaction[] {
  const ids = new Set<string>(); const assetIds = new Set<string>();
  return transactions.filter(item => {
    if (!isDemoTransaction(item) || ids.has(item.id) || assetIds.has(item.assetId) || (assets && !assets.some(asset => asset.id === item.assetId && asset.status === "COMPLETED"))) return false;
    ids.add(item.id); assetIds.add(item.assetId); return true;
  });
}
export function buyerDifference(item: DemoTransaction): bigint | null {
  return item.referenceNewPrice === undefined ? null : BigInt(item.referenceNewPrice) - BigInt(item.transactionPrice) - BigInt(item.buyerShippingCost);
}
export function calculateImpact(transactions: DemoTransaction[], assets?: Asset[]) {
  const completed = completedTransactions(transactions, assets);
  const comparable = completed.filter(item => item.referenceNewPrice !== undefined);
  const differences = comparable.map(item => buyerDifference(item)!);
  return {
    count: completed.length,
    transactionTotal: completed.reduce((sum, item) => sum + BigInt(item.transactionPrice), 0n),
    sellerNet: completed.reduce((sum, item) => sum + BigInt(item.transactionPrice) - BigInt(item.sellerCost), 0n),
    comparableCount: comparable.length,
    unavailableCount: completed.length - comparable.length,
    estimatedSavings: differences.reduce((sum, value) => sum + value, 0n),
    negativeSavingsCount: differences.filter(value => value < 0n).length,
  };
}
export function validAmount(value: string): boolean { return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)); }
export type ScenarioInput = { shops: string; transactionsPerShop: string; recoveryPerTransaction: string; savingsPerTransaction: string };
export function calculateScenario(input: ScenarioInput): { count: bigint; recovery: bigint; savings: bigint } | null {
  const values = [input.shops, input.transactionsPerShop, input.recoveryPerTransaction, input.savingsPerTransaction];
  if (values.some(value => !/^\d{1,15}$/.test(value))) return null;
  const [shops, transactionsPerShop, recoveryPerTransaction, savingsPerTransaction] = values.map(value => BigInt(value));
  const count = shops * transactionsPerShop;
  return { count, recovery: count * recoveryPerTransaction, savings: count * savingsPerTransaction };
}
