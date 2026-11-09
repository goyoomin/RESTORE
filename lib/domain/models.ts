export const CATEGORIES = ["주방·카페", "냉장·냉동", "가구·인테리어", "진열·판매", "사무·전자", "기타"] as const;
export type Category = (typeof CATEGORIES)[number];
export const ASSET_STATUSES = ["AVAILABLE", "RESERVED", "COMPLETED"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type DataOrigin = "seed" | "user";

export interface Asset {
  id: string;
  title: string;
  category: Category;
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
  schemaVersion: 1;
  assets: Asset[];
  buyerNeeds: BuyerNeed[];
  transactions: DemoTransaction[];
  favoriteIds?: string[];
}
