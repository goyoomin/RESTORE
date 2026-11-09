"use client";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { useDemoStore } from "@/lib/state/demo-provider";
import { availability, availabilityLabels, daysUntil, redactContacts } from "@/lib/market/filters";
import { AssetImage } from "./asset-image";
import { FavoriteButton } from "./favorite-button";
import { TransactionSimulation } from "./transaction-simulation";
import { Container } from "./ui";
import { LegacyItemTypeEditor } from "./legacy-item-type-editor";
import { useLocalToday } from "@/lib/market/use-local-today";
export function AssetDetail({ id, buyerNeedId }: { id: string; buyerNeedId?: string }) {
  const demo = useDemoStore();
  const asset = demo.status === "ready" ? demo.data.assets.find(item => item.id === id) : undefined;
  const today = useLocalToday();
  const state = asset ? availability(asset, today) : null;
  return <main className="detail-page"><Container><Link className="registration-back" href="/market"><ArrowLeft size={16} /> 장비 목록으로</Link>
    {demo.status === "loading" && <p className="demo-state" role="status">장비 정보를 불러오는 중입니다.</p>}
    {demo.status === "error" && <div className="demo-state" role="alert">{demo.error} <button type="button" className="demo-reset" onClick={demo.refresh}>다시 불러오기</button></div>}
    {demo.status === "ready" && !asset && <div className="market-empty" role="status"><h1>장비를 찾을 수 없어요</h1><p>이 브라우저에 등록되지 않았거나 초기화된 장비입니다.</p><Link className="button button-secondary" href="/market">장비 목록 둘러보기</Link></div>}
    {asset && state && <><div className="detail-grid"><div className="detail-image"><AssetImage image={asset.image} title={redactContacts(asset.title)} itemType={asset.itemType} /><span className={`market-status status-${state.toLowerCase()}`}>{availabilityLabels[state]}</span></div><div className="detail-summary"><span className="eyebrow">{asset.dataOrigin === "seed" ? "가상 시연 데이터" : "사용자 등록 데모"} · {asset.category} · {asset.itemType ?? "품목 미확인"}</span><h1>{redactContacts(asset.title)}</h1><p className="detail-price">{asset.askingPrice.toLocaleString("ko-KR")}원 <small>시연 가격</small></p><div className="detail-divider" /><dl className="detail-facts">{[["세부 품목", asset.itemType ?? "품목 미확인"], ["장비 상태", redactContacts(asset.condition)], ["지역", `${asset.region} ${asset.district}`], ["처분 예정일", `${asset.disposalDeadline}${state === "AVAILABLE" && daysUntil(asset.disposalDeadline, today) <= 7 ? " · 마감 임박" : ""}`], ["거래 가능 상태", availabilityLabels[state]]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><FavoriteButton id={asset.id} title={redactContacts(asset.title)} /><p className="favorite-help">관심 표시는 이 브라우저에만 저장되며, 판매자에게 전달되지 않습니다.</p><LegacyItemTypeEditor asset={asset} /></div></div><div className="detail-lower"><section className="detail-section"><h2>장비 설명</h2><p className="detail-description">{asset.description ? redactContacts(asset.description) : "등록된 설명이 없습니다."}</p></section><section className="detail-section"><h2><ClipboardCheck size={20} aria-hidden="true" /> 장비 인수 시 확인할 사항</h2><ul><li>장비의 작동 상태와 사용 흔적을 확인해 주세요.</li><li>운반·설치 방법과 추가 비용을 미리 살펴보세요.</li><li>실제 서비스에서는 소유권과 거래 조건을 별도로 확인해야 합니다.</li></ul></section><TransactionSimulation asset={asset} buyerNeedId={buyerNeedId} /></div></>}
  </Container></main>;
}
