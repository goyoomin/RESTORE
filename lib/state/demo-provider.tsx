"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Asset, AssetStatus, BuyerNeed, DemoStore, DemoTransaction, ItemType } from "../domain/models";
import { createDemoRepository, DemoStorageError, STORAGE_KEY, type DemoRepository } from "../repositories/demo-repository";

type View = { status: "loading"; data: null; error: null } | { status: "ready"; data: DemoStore; error: null } | { status: "error"; data: null; error: string };
type DemoContextValue = View & { addAsset: (asset: Asset) => boolean; toggleFavorite: (id: string) => boolean; setAssetStatus: (id: string, status: AssetStatus) => boolean; setLegacyAssetItemType: (id: string, itemType: ItemType) => boolean; addBuyerNeed: (need: BuyerNeed) => boolean; completeTransaction: (transaction: DemoTransaction, today: string) => boolean; reset: () => boolean; refresh: () => void };
const DemoContext = createContext<DemoContextValue | null>(null);
const loading: View = { status: "loading", data: null, error: null };
function repository(): DemoRepository { return createDemoRepository(window.localStorage); }
function message(error: unknown) { return error instanceof DemoStorageError ? error.message : "브라우저 저장소를 사용할 수 없습니다. 브라우저 설정을 확인해 주세요."; }
export function DemoProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>(loading);
  const run = useCallback((action: (repo: DemoRepository) => DemoStore, preserveOnFailure = false): boolean => {
    try { setView({ status: "ready", data: action(repository()), error: null }); return true; }
    catch (error) { if (!preserveOnFailure) setView({ status: "error", data: null, error: message(error) }); return false; }
  }, []);
  const refresh = useCallback(() => { run(repo => repo.load()); }, [run]);
  useEffect(() => {
    // The server and the first client render share the same loading state.
    const timer = window.setTimeout(refresh, 0);
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) refresh(); };
    window.addEventListener("storage", onStorage);
    return () => { window.clearTimeout(timer); window.removeEventListener("storage", onStorage); };
  }, [refresh]);
  const value = useMemo<DemoContextValue>(() => ({ ...view, refresh, addAsset: asset => run(repo => repo.addAsset(asset)), toggleFavorite: id => run(repo => repo.toggleFavorite(id)), setAssetStatus: (id, status) => run(repo => repo.setAssetStatus(id, status)), setLegacyAssetItemType: (id, itemType) => run(repo => repo.setLegacyAssetItemType(id, itemType), true), addBuyerNeed: need => run(repo => repo.addBuyerNeed(need)), completeTransaction: (transaction, today) => run(repo => repo.completeTransaction(transaction, today), true), reset: () => run(repo => repo.reset()) }), [view, refresh, run]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemoStore(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoStore must be used inside DemoProvider");
  return context;
}
