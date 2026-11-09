"use client";

import Link from "next/link";
import { ArrowRight, MapPin, PackageOpen } from "lucide-react";
import { useMemo } from "react";
import { useDemoStore } from "@/lib/state/demo-provider";
import { availability } from "@/lib/market/filters";
import { useLocalToday } from "@/lib/market/use-local-today";
import { AssetImage } from "./asset-image";

export function AssetPreview() {
  const demo = useDemoStore();
  const today = useLocalToday();
  const assets = useMemo(() => {
    if (demo.status !== "ready") return [];
    return demo.data.assets
      .filter((asset) => availability(asset, today) === "AVAILABLE")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
  }, [demo, today]);

  return (
    <section className="asset-preview" aria-labelledby="asset-preview-title">
      <div className="asset-preview-heading">
        <div>
          <span className="eyebrow">A SECOND LIFE FOR EQUIPMENT</span>
          <h2 id="asset-preview-title">새로운 시작을 기다리는 장비들</h2>
          <p>현재 등록된 장비를 살펴보고, 필요한 물품은 상세 조건을 확인해 보세요.</p>
        </div>
        <Link className="preview-more" href="/market">장비 전체 보기 <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>

      {demo.status === "loading" && <p className="preview-state" role="status">시연 데이터를 불러오는 중입니다.</p>}
      {demo.status === "error" && <p className="preview-state" role="alert">장비 미리보기를 불러오지 못했습니다. <Link href="/market">장비 목록에서 다시 확인하기</Link></p>}
      {demo.status === "ready" && assets.length > 0 && (
        <div className="preview-grid">
          {assets.map((asset) => (
            <Link className="preview-card" key={asset.id} href={`/market/${encodeURIComponent(asset.id)}`}>
              <div className="preview-image"><AssetImage image={asset.image} title={asset.title} /></div>
              <div className="preview-card-copy">
                <span className="preview-category">{asset.category} <span aria-hidden="true">·</span> {asset.dataOrigin === "seed" ? "가상 시연 데이터" : "사용자 등록 데모"}</span>
                <h3>{asset.title}</h3>
                <span className="preview-location"><MapPin size={14} aria-hidden="true" />{asset.region} {asset.district}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {demo.status === "ready" && assets.length === 0 && (
        <div className="preview-empty"><PackageOpen size={25} aria-hidden="true" /><p>현재 미리볼 수 있는 장비가 없습니다.</p><Link href="/market">장비 목록 확인하기</Link></div>
      )}
      <p className="preview-disclaimer">장비와 정보는 시연용입니다. 화면에 표시된 내용은 실제 매물이나 거래를 뜻하지 않습니다.</p>
    </section>
  );
}
