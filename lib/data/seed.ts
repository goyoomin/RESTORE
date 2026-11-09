import type { Asset, BuyerNeed, DemoStore } from "../domain/models.ts";

// 모든 이름과 가격은 설명을 위한 가상 값이며 실제 시세가 아닙니다.
const assets: Asset[] = [
  { id: "seed-coffee", title: "업소용 커피머신", category: "주방·카페", description: "가상의 수원 카페에서 사용하던 2구 커피머신입니다.", condition: "사용감 있음", askingPrice: 1200000, region: "경기도", district: "수원시", disposalDeadline: "2027-03-20", status: "AVAILABLE", image: "coffee", createdAt: "2026-11-01", dataOrigin: "seed" },
  { id: "seed-fridge", title: "업소용 냉장고", category: "냉장·냉동", description: "가상의 안양 음식점에서 사용하던 냉장고입니다.", condition: "양호", askingPrice: 550000, region: "경기도", district: "안양시", disposalDeadline: "2027-02-15", status: "AVAILABLE", image: "refrigerator", createdAt: "2026-11-02", dataOrigin: "seed" },
  { id: "seed-showcase", title: "베이커리 진열 쇼케이스", category: "진열·판매", description: "가상의 성남 베이커리에서 사용하던 쇼케이스입니다.", condition: "양호", askingPrice: 700000, region: "경기도", district: "성남시", disposalDeadline: "2027-04-10", status: "AVAILABLE", image: "store", createdAt: "2026-11-03", dataOrigin: "seed" },
  { id: "seed-tables", title: "원목 테이블 세트", category: "가구·인테리어", description: "가상의 부천 음식점 테이블과 의자 세트입니다.", condition: "사용감 있음", askingPrice: 300000, region: "경기도", district: "부천시", disposalDeadline: "2027-02-28", status: "RESERVED", image: "table", createdAt: "2026-11-04", dataOrigin: "seed" },
  { id: "seed-ice", title: "카페용 제빙기", category: "냉장·냉동", description: "가상의 고양 카페에서 사용하던 제빙기입니다.", condition: "양호", askingPrice: 450000, region: "경기도", district: "고양시", disposalDeadline: "2027-03-01", status: "AVAILABLE", image: "snowflake", createdAt: "2026-11-05", dataOrigin: "seed" },
  { id: "seed-shelf", title: "매장 진열대", category: "진열·판매", description: "가상의 화성 매장에서 사용하던 조립식 진열대입니다.", condition: "사용감 있음", askingPrice: 180000, region: "경기도", district: "화성시", disposalDeadline: "2027-05-10", status: "AVAILABLE", image: "shelf", createdAt: "2026-11-06", dataOrigin: "seed" },
  { id: "seed-desk", title: "사무용 책상", category: "사무·전자", description: "가상의 용인 사무실에서 사용하던 책상입니다.", condition: "양호", askingPrice: 100000, region: "경기도", district: "용인시", disposalDeadline: "2027-04-01", status: "AVAILABLE", image: "desk", createdAt: "2026-11-07", dataOrigin: "seed" },
  { id: "seed-stove", title: "업소용 가스레인지", category: "주방·카페", description: "가상의 평택 음식점에서 사용하던 조리 장비입니다.", condition: "사용감 있음", askingPrice: 250000, region: "경기도", district: "평택시", disposalDeadline: "2027-03-15", status: "AVAILABLE", image: "utensils", createdAt: "2026-11-08", dataOrigin: "seed" },
];
const buyerNeeds: BuyerNeed[] = [
  { id: "need-coffee", category: "주방·카페", maxBudget: 1500000, preferredRegion: "경기도", preferredDistrict: "수원시", desiredPickupDate: "2027-03-10", createdAt: "2026-11-08" },
  { id: "need-ice", category: "냉장·냉동", maxBudget: 500000, preferredRegion: "경기도", preferredDistrict: "고양시", desiredPickupDate: "2027-02-20", createdAt: "2026-11-08" },
  { id: "need-other", category: "기타", maxBudget: 50000, preferredRegion: "경기도", preferredDistrict: "파주시", desiredPickupDate: "2027-01-20", createdAt: "2026-11-08" },
];
export function createSeedStore(): DemoStore {
  return structuredClone({ schemaVersion: 1 as const, assets, buyerNeeds, transactions: [] });
}
