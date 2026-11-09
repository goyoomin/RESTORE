import type { Asset, BuyerNeed, DemoTransaction } from "../domain/models.ts";
import { hasKnownAssetItemType, hasKnownNeedItemType, isDate } from "../domain/validation.ts";

/** Returns a user-facing reason when a simulated completion violates current conditions. */
export function transactionConditionError(asset: Asset, transaction: DemoTransaction, need: BuyerNeed | undefined, today: string): string | null {
  if (!isDate(today) || !isDate(transaction.completedAt) || transaction.completedAt !== today) return "가상 완료일이 오늘 날짜와 일치하지 않습니다. 다시 확인해 주세요.";
  if (asset.status !== "AVAILABLE") return "현재 거래 가능한 상태의 장비만 완료 처리할 수 있습니다.";
  if (asset.disposalDeadline < today) return "처분 기한이 지난 장비는 완료 처리할 수 없습니다.";
  if (transaction.transactionPrice <= 0 || transaction.transactionPrice > asset.askingPrice) return "거래금액은 0원보다 크고 등록된 희망 가격 이하여야 합니다.";
  if (!need) return null;
  if (!hasKnownAssetItemType(asset) || !hasKnownNeedItemType(need) || asset.category !== need.category || asset.itemType !== need.itemType) return "구매 조건과 장비 품목이 정확히 일치하지 않아 완료할 수 없습니다.";
  if (transaction.transactionPrice + transaction.buyerShippingCost > need.maxBudget || !Number.isSafeInteger(transaction.transactionPrice + transaction.buyerShippingCost)) return "거래금액과 구매자 운송비의 합계가 설정한 예산을 초과합니다.";
  if (need.desiredPickupDate < today || need.desiredPickupDate > asset.disposalDeadline) return "인수 희망일이 오늘 이후이며 장비 처분 기한 이내인지 확인해 주세요.";
  return null;
}
