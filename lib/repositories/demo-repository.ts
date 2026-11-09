import type { Asset, AssetStatus, BuyerNeed, DemoStore, DemoTransaction } from "../domain/models.ts";
import { isAsset, isBuyerNeed, isDemoStore, isDemoTransaction } from "../domain/validation.ts";
import { createSeedStore } from "../data/seed.ts";

export const STORAGE_KEY = "restore-demo-v1";
export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export class DemoStorageError extends Error {
  readonly reason: "invalid" | "unavailable" | "input";
  constructor(reason: "invalid" | "unavailable" | "input", message: string) { super(message); this.name = "DemoStorageError"; this.reason = reason; }
}
export interface DemoRepository {
  load(): DemoStore;
  addAsset(asset: Asset): DemoStore;
  toggleFavorite(id: string): DemoStore;
  setAssetStatus(id: string, status: AssetStatus): DemoStore;
  addBuyerNeed(need: BuyerNeed): DemoStore;
  completeTransaction(transaction: DemoTransaction): DemoStore;
  reset(): DemoStore;
}

export function createDemoRepository(storage: StoragePort): DemoRepository {
  function write(store: DemoStore): DemoStore {
    if (!isDemoStore(store)) throw new DemoStorageError("input", "데이터 형식이 올바르지 않습니다.");
    try { storage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch { throw new DemoStorageError("unavailable", "브라우저 저장소에 저장할 수 없습니다. 저장 공간과 브라우저 설정을 확인해 주세요."); }
    return store;
  }
  function load(): DemoStore {
    let raw: string | null;
    try { raw = storage.getItem(STORAGE_KEY); }
    catch { throw new DemoStorageError("unavailable", "브라우저 저장소를 읽을 수 없습니다. 브라우저 설정을 확인해 주세요."); }
    if (raw === null) return write(createSeedStore());
    let parsed: unknown;
    try { parsed = JSON.parse(raw); }
    catch { throw new DemoStorageError("invalid", "저장된 데이터의 형식이 올바르지 않습니다. 초기화하면 가상 데이터로 복구할 수 있습니다."); }
    if (!isDemoStore(parsed)) throw new DemoStorageError("invalid", "저장된 데이터가 유효하지 않거나 지원하지 않는 버전입니다. 초기화하면 가상 데이터로 복구할 수 있습니다.");
    return parsed;
  }
  return {
    load,
    addAsset(asset) {
      if (!isAsset(asset) || asset.dataOrigin !== "user") throw new DemoStorageError("input", "등록할 자산 정보가 올바르지 않습니다.");
      const store = load();
      if (store.assets.some(item => item.id === asset.id)) throw new DemoStorageError("input", "이미 존재하는 자산입니다.");
      return write({ ...store, assets: [...store.assets, asset] });
    },
    toggleFavorite(id) {
      const store = load();
      if (!store.assets.some(asset => asset.id === id)) throw new DemoStorageError("input", "자산을 찾을 수 없습니다.");
      const favorites = store.favoriteIds ?? [];
      return write({ ...store, favoriteIds: favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id] });
    },
    setAssetStatus(id, status) {
      const store = load();
      if (!store.assets.some(asset => asset.id === id)) throw new DemoStorageError("input", "자산을 찾을 수 없습니다.");
      if (status !== "COMPLETED" && store.transactions.some(t => t.assetId === id)) throw new DemoStorageError("input", "완료 기록이 있는 자산의 상태를 변경할 수 없습니다.");
      return write({ ...store, assets: store.assets.map(asset => asset.id === id ? { ...asset, status } : asset) });
    },
    addBuyerNeed(need) {
      if (!isBuyerNeed(need)) throw new DemoStorageError("input", "수요 정보가 올바르지 않습니다.");
      const store = load();
      if (store.buyerNeeds.some(item => item.id === need.id)) throw new DemoStorageError("input", "이미 존재하는 수요입니다.");
      return write({ ...store, buyerNeeds: [...store.buyerNeeds, need] });
    },
    completeTransaction(transaction) {
      if (!isDemoTransaction(transaction)) throw new DemoStorageError("input", "가상 거래 정보가 올바르지 않습니다.");
      const store = load();
      const asset = store.assets.find(item => item.id === transaction.assetId);
      if (!asset || asset.status !== "AVAILABLE" || transaction.completedAt > asset.disposalDeadline || store.transactions.some(item => item.id === transaction.id || item.assetId === transaction.assetId) || (transaction.buyerNeedId && !store.buyerNeeds.some(item => item.id === transaction.buyerNeedId))) throw new DemoStorageError("input", "가상 거래를 완료할 수 없습니다.");
      return write({ ...store, assets: store.assets.map(item => item.id === asset.id ? { ...item, status: "COMPLETED" } : item), transactions: [...store.transactions, transaction] });
    },
    reset: () => write(createSeedStore()),
  };
}
