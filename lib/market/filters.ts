import type { Asset } from "../domain/models.ts";
export type Availability = "AVAILABLE" | "RESERVED" | "COMPLETED" | "EXPIRED";
export type SortOrder = "latest" | "price-low" | "price-high" | "deadline";
export type MarketFilters = { query: string; category: string; district: string; condition: string; minPrice: string; maxPrice: string; availability: string; sort: SortOrder };
export const emptyFilters = (): MarketFilters => ({ query: "", category: "", district: "", condition: "", minPrice: "", maxPrice: "", availability: "", sort: "latest" });
export function localToday(now = new Date()): string { return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }
export function availability(asset: Asset, today: string): Availability {
  if (asset.status === "COMPLETED") return "COMPLETED";
  return asset.disposalDeadline < today ? "EXPIRED" : asset.status;
}
export const availabilityLabels: Record<Availability, string> = { AVAILABLE: "거래 가능", RESERVED: "예약 중", COMPLETED: "가상 완료", EXPIRED: "처분 기한 지남" };
export function daysUntil(deadline: string, today: string): number { return Math.round((Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000); }
export function priceError(filters: MarketFilters): string {
  for (const value of [filters.minPrice, filters.maxPrice]) if (value && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))) return "가격은 0 이상의 정수로 입력해 주세요.";
  if (filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)) return "최소 가격은 최대 가격보다 클 수 없습니다.";
  return "";
}
export function filterAssets(assets: Asset[], filters: MarketFilters, today: string): Asset[] {
  if (priceError(filters)) return [];
  const query = filters.query.trim().toLocaleLowerCase("ko-KR");
  return assets.map((asset, index) => ({ asset, index })).filter(({ asset }) => {
    return (!query || [asset.title, asset.category, asset.itemType ?? "", asset.description].some(value => value.toLocaleLowerCase("ko-KR").includes(query))) &&
      (!filters.category || filters.category === asset.category) && (!filters.district || filters.district === asset.district) && (!filters.condition || filters.condition === asset.condition) &&
      (!filters.minPrice || asset.askingPrice >= Number(filters.minPrice)) && (!filters.maxPrice || asset.askingPrice <= Number(filters.maxPrice)) &&
      (!filters.availability || availability(asset, today) === filters.availability);
  }).sort((a, b) => {
    const byLatest = b.asset.createdAt.localeCompare(a.asset.createdAt) || b.index - a.index;
    if (filters.sort === "price-low") return a.asset.askingPrice - b.asset.askingPrice || byLatest;
    if (filters.sort === "price-high") return b.asset.askingPrice - a.asset.askingPrice || byLatest;
    if (filters.sort === "deadline") return Number(a.asset.disposalDeadline < today) - Number(b.asset.disposalDeadline < today) || a.asset.disposalDeadline.localeCompare(b.asset.disposalDeadline) || byLatest;
    return byLatest;
  }).map(({ asset }) => asset);
}
// 입력란에도 개인정보를 넣지 않도록 안내하고, 표시 시 흔한 연락처 패턴을 추가로 가린다.
export function redactContacts(value: string): string {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[이메일 비공개]").replace(/(?<!\d)(?:\+82[\s.-]?)?(?:0\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{4}(?!\d)/g, "[연락처 비공개]");
}
