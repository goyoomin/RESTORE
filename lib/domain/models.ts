export const CATEGORIES = ["주방·카페", "냉장·냉동", "가구·인테리어", "진열·판매", "사무·전자", "기타"] as const;
export type Category = (typeof CATEGORIES)[number];
export const ITEM_TYPES_BY_CATEGORY = {
  "주방·카페": ["커피머신", "가스레인지", "오븐", "식기세척기", "튀김기", "믹서기", "기타 주방 장비"],
  "냉장·냉동": ["업소용 냉장고", "냉동고", "제빙기", "냉장 쇼케이스"],
  "가구·인테리어": ["테이블·의자", "사무용 책상", "조명", "기타 가구"],
  "진열·판매": ["진열대", "진열 쇼케이스", "계산대·POS", "기타 판매 집기"],
  "사무·전자": ["사무용 책상", "컴퓨터", "모니터", "프린터·복합기", "기타 사무·전자 장비"],
  "기타": ["기타 장비"],
} as const satisfies Record<Category, readonly string[]>;
export type ItemType = (typeof ITEM_TYPES_BY_CATEGORY)[Category][number];
export const ASSET_STATUSES = ["AVAILABLE", "RESERVED", "COMPLETED"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type DataOrigin = "seed" | "user";

export interface Asset {
  id: string;
  title: string;
  category: Category;
  /** Missing only on migrated legacy records; never treated as an exact match. */
  itemType?: ItemType;
  description: string;
  condition: string;
  askingPrice: number;
  region: string;
  district: string;
  neighborhood?: string;
  disposalDeadline: string;
  status: AssetStatus;
  image: string;
  createdAt: string;
  dataOrigin: DataOrigin;
}
export interface BuyerNeed {
  id: string;
  category: Category;
  /** Missing only on migrated legacy demand records. */
  itemType?: ItemType;
  maxBudget: number;
  preferredRegion: string;
  preferredDistrict: string;
  preferredNeighborhood?: string;
  desiredPickupDate: string;
  createdAt: string;
}
export interface DemoTransaction {
  id: string;
  assetId: string;
  buyerNeedId?: string;
  transactionPrice: number;
  sellerCost: number;
  buyerShippingCost: number;
  referenceNewPrice?: number;
  comparisonSource?: string;
  completedAt: string;
  simulated: true;
}
export interface DemoStore {
  schemaVersion: 2;
  assets: Asset[];
  buyerNeeds: BuyerNeed[];
  transactions: DemoTransaction[];
  favoriteIds?: string[];
}
