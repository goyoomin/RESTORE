import type { Asset, BuyerNeed, DemoStore } from "../domain/models.ts";
import { localToday } from "../market/filters.ts";

// Names and prices are fictional demo values. Deadlines are relative to the day
// a fresh demo store is created, so a reset keeps the demonstration usable.
type SeedAsset = Omit<Asset, "createdAt" | "disposalDeadline"> & { deadlineOffset: number };
const assets: SeedAsset[] = [
  { id: "seed-coffee", title: "업소용 커피머신", category: "주방·카페", itemType: "커피머신", description: "가상의 수원 카페에서 사용하던 2구 커피머신입니다.", condition: "사용감 있음", askingPrice: 1200000, region: "경기도", district: "수원시", deadlineOffset: 75, status: "AVAILABLE", image: "coffee", dataOrigin: "seed" },
  { id: "seed-fridge", title: "업소용 냉장고", category: "냉장·냉동", itemType: "업소용 냉장고", description: "가상의 안양 음식점에서 사용하던 냉장고입니다.", condition: "양호", askingPrice: 550000, region: "경기도", district: "안양시", deadlineOffset: 60, status: "AVAILABLE", image: "refrigerator", dataOrigin: "seed" },
  { id: "seed-showcase", title: "베이커리 진열 쇼케이스", category: "진열·판매", itemType: "진열 쇼케이스", description: "가상의 성남 베이커리에서 사용하던 쇼케이스입니다.", condition: "양호", askingPrice: 700000, region: "경기도", district: "성남시", deadlineOffset: 120, status: "AVAILABLE", image: "store", dataOrigin: "seed" },
  { id: "seed-tables", title: "원목 테이블 세트", category: "가구·인테리어", itemType: "테이블·의자", description: "가상의 부천 음식점 테이블과 의자 세트입니다.", condition: "사용감 있음", askingPrice: 300000, region: "경기도", district: "부천시", deadlineOffset: 90, status: "RESERVED", image: "table", dataOrigin: "seed" },
  { id: "seed-ice", title: "카페용 제빙기", category: "냉장·냉동", itemType: "제빙기", description: "가상의 고양 카페에서 사용하던 제빙기입니다.", condition: "양호", askingPrice: 450000, region: "경기도", district: "고양시", deadlineOffset: 60, status: "AVAILABLE", image: "snowflake", dataOrigin: "seed" },
  { id: "seed-shelf", title: "매장 진열대", category: "진열·판매", itemType: "진열대", description: "가상의 화성 매장에서 사용하던 조립식 진열대입니다.", condition: "사용감 있음", askingPrice: 180000, region: "경기도", district: "화성시", deadlineOffset: 150, status: "AVAILABLE", image: "shelf", dataOrigin: "seed" },
  { id: "seed-desk", title: "사무용 책상", category: "사무·전자", itemType: "사무용 책상", description: "가상의 용인 사무실에서 사용하던 책상입니다.", condition: "양호", askingPrice: 100000, region: "경기도", district: "용인시", deadlineOffset: 105, status: "AVAILABLE", image: "desk", dataOrigin: "seed" },
  { id: "seed-stove", title: "업소용 가스레인지", category: "주방·카페", itemType: "가스레인지", description: "가상의 평택 음식점에서 사용하던 조리 장비입니다.", condition: "사용감 있음", askingPrice: 250000, region: "경기도", district: "평택시", deadlineOffset: 80, status: "AVAILABLE", image: "utensils", dataOrigin: "seed" },
];
type SeedNeed = Omit<BuyerNeed, "createdAt" | "desiredPickupDate"> & { pickupOffset: number };
const buyerNeeds: SeedNeed[] = [
  { id: "need-coffee", category: "주방·카페", itemType: "커피머신", maxBudget: 1500000, preferredRegion: "경기도", preferredDistrict: "수원시", pickupOffset: 45 },
  { id: "need-ice", category: "냉장·냉동", itemType: "제빙기", maxBudget: 500000, preferredRegion: "경기도", preferredDistrict: "고양시", pickupOffset: 40 },
  { id: "need-other", category: "주방·카페", itemType: "오븐", maxBudget: 50000, preferredRegion: "경기도", preferredDistrict: "파주시", pickupOffset: 30 },
];

function addDays(date: string, amount: number): string {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + amount);
  return result.toISOString().slice(0, 10);
}

export function createSeedStore(today = localToday()): DemoStore {
  return structuredClone({
    schemaVersion: 2 as const,
    assets: assets.map(({ deadlineOffset, ...asset }) => ({ ...asset, createdAt: today, disposalDeadline: addDays(today, deadlineOffset) })),
    buyerNeeds: buyerNeeds.map(({ pickupOffset, ...need }) => ({ ...need, createdAt: today, desiredPickupDate: addDays(today, pickupOffset) })),
    transactions: [],
  });
}
