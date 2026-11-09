import { ASSET_STATUSES, CATEGORIES, ITEM_TYPES_BY_CATEGORY, type Asset, type BuyerNeed, type DemoStore, type DemoTransaction } from "./models.ts";

type RecordValue = Record<string, unknown>;
const record = (v: unknown): v is RecordValue => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const money = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
const optionalText = (v: unknown) => v === undefined || text(v);
const category = (v: unknown) => typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
export function isItemTypeForCategory(v: unknown, c: unknown): v is NonNullable<Asset["itemType"]> {
  return typeof c === "string" && typeof v === "string" && (ITEM_TYPES_BY_CATEGORY[c as keyof typeof ITEM_TYPES_BY_CATEGORY] as readonly string[] | undefined)?.includes(v) === true;
}
export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(`${value}T00:00:00Z`);
  return year >= 1000 && !Number.isNaN(d.getTime()) && d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
}
export function isAsset(v: unknown): v is Asset {
  return record(v) && text(v.id) && text(v.title) && category(v.category) && (v.itemType === undefined || isItemTypeForCategory(v.itemType, v.category)) && typeof v.description === "string" && text(v.condition) && money(v.askingPrice) && text(v.region) && text(v.district) && (v.neighborhood === undefined || typeof v.neighborhood === "string") && isDate(v.disposalDeadline) && typeof v.status === "string" && (ASSET_STATUSES as readonly string[]).includes(v.status) && text(v.image) && isDate(v.createdAt) && (v.dataOrigin === "seed" || v.dataOrigin === "user");
}
export function isBuyerNeed(v: unknown): v is BuyerNeed {
  return record(v) && text(v.id) && category(v.category) && (v.itemType === undefined || isItemTypeForCategory(v.itemType, v.category)) && money(v.maxBudget) && text(v.preferredRegion) && text(v.preferredDistrict) && optionalText(v.preferredNeighborhood) && isDate(v.desiredPickupDate) && isDate(v.createdAt);
}
export function hasKnownAssetItemType(v: Asset): v is Asset & { itemType: NonNullable<Asset["itemType"]> } { return isItemTypeForCategory(v.itemType, v.category); }
export function hasKnownNeedItemType(v: BuyerNeed): v is BuyerNeed & { itemType: NonNullable<BuyerNeed["itemType"]> } { return isItemTypeForCategory(v.itemType, v.category); }
export function isDemoTransaction(v: unknown): v is DemoTransaction {
  return record(v) && text(v.id) && text(v.assetId) && optionalText(v.buyerNeedId) && money(v.transactionPrice) && money(v.sellerCost) && money(v.buyerShippingCost) && (v.referenceNewPrice === undefined || money(v.referenceNewPrice)) && optionalText(v.comparisonSource) && isDate(v.completedAt) && v.simulated === true;
}
const unique = (items: { id: string }[]) => new Set(items.map(item => item.id)).size === items.length;
export function isDemoStore(v: unknown): v is DemoStore {
  if (!record(v) || v.schemaVersion !== 2 || !Array.isArray(v.assets) || !v.assets.every(isAsset) || !Array.isArray(v.buyerNeeds) || !v.buyerNeeds.every(isBuyerNeed) || !Array.isArray(v.transactions) || !v.transactions.every(isDemoTransaction)) return false;
  const assets: Asset[] = v.assets, needs: BuyerNeed[] = v.buyerNeeds, transactions: DemoTransaction[] = v.transactions;
  if (v.favoriteIds !== undefined && (!Array.isArray(v.favoriteIds) || !v.favoriteIds.every(text) || new Set(v.favoriteIds).size !== v.favoriteIds.length || !v.favoriteIds.every(id => assets.some(a => a.id === id)))) return false;
  if (!unique(assets) || !unique(needs) || !unique(transactions) || new Set(transactions.map(t => t.assetId)).size !== transactions.length) return false;
  return transactions.every(t => assets.some(a => a.id === t.assetId && a.status === "COMPLETED") && (!t.buyerNeedId || needs.some(n => n.id === t.buyerNeedId)));
}
