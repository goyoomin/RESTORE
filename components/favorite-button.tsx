"use client";
import { Heart } from "lucide-react";
import { useDemoStore } from "@/lib/state/demo-provider";
export function FavoriteButton({ id, title, compact = false }: { id: string; title: string; compact?: boolean }) {
  const demo = useDemoStore();
  const active = demo.status === "ready" && (demo.data.favoriteIds ?? []).includes(id);
  return <button type="button" className={`favorite-button ${active ? "is-favorite" : ""} ${compact ? "favorite-compact" : ""}`} onClick={() => demo.toggleFavorite(id)} aria-pressed={active} aria-label={`${title} 관심 ${active ? "해제" : "추가"}`}><Heart size={18} fill={active ? "currentColor" : "none"} aria-hidden="true" /><span>{active ? "관심 저장됨" : "관심 추가"}</span></button>;
}
