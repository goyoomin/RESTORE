import type { Asset, BuyerNeed } from "../domain/models.ts";
import { isAsset, isBuyerNeed, isDate } from "../domain/validation.ts";
import { daysUntil } from "../market/filters.ts";
export type MatchResult = { asset: Asset; score: number; reasons: string[]; points: { category: number; price: number; location: number; schedule: number } };
export function calculateMatchScore(asset: Asset, need: BuyerNeed, today: string): MatchResult | null {
  if (!isDate(today) || !isAsset(asset) || !isBuyerNeed(need) || need.maxBudget <= 0 || asset.status !== "AVAILABLE" || asset.category !== need.category || asset.askingPrice > need.maxBudget || asset.disposalDeadline < today || need.desiredPickupDate < today || need.desiredPickupDate > asset.disposalDeadline || asset.region !== "경기도" || need.preferredRegion !== "경기도") return null;
  const ratio = asset.askingPrice / need.maxBudget;
  const price = ratio <= 0.6 ? 25 : ratio <= 0.8 ? 20 : 15;
  const sameCity = asset.district === need.preferredDistrict;
  const requestedNeighborhood = need.preferredNeighborhood?.trim();
  const sameNeighborhood = !!requestedNeighborhood && asset.neighborhood?.trim() === requestedNeighborhood;
  const location = sameCity ? (!requestedNeighborhood || sameNeighborhood ? 25 : 18) : 8;
  const days = daysUntil(asset.disposalDeadline, need.desiredPickupDate);
  const schedule = days >= 7 ? 10 : days >= 3 ? 7 : 5;
  const areaReason = !sameCity ? "희망 시·군은 다르지만 경기도 내 장비입니다." : !requestedNeighborhood ? "같은 시·군입니다. 세부 지역 미입력으로 지역 만점을 적용했습니다." : sameNeighborhood ? "같은 시·군과 세부 지역입니다." : "같은 시·군입니다. 세부 지역은 다르거나 등록되지 않았습니다.";
  return { asset, score: 40 + price + location + schedule, points: { category: 40, price, location, schedule }, reasons: ["선택하신 카테고리와 일치합니다. (40점)", `예산 이내이며 예산 대비 가격 구간은 ${price}점입니다.`, `${areaReason} (${location}점)`, `인수 희망일은 처분 예정일 ${days}일 전입니다. (${schedule}점)`] };
}
export function rankMatches(assets: Asset[], need: BuyerNeed, today: string): MatchResult[] {
  return assets.map(asset => calculateMatchScore(asset, need, today)).filter((item): item is MatchResult => item !== null).sort((a, b) => b.score - a.score || b.asset.createdAt.localeCompare(a.asset.createdAt) || a.asset.id.localeCompare(b.asset.id));
}
