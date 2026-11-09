"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Asset, DemoTransaction } from "@/lib/domain/models";
import { validAmount } from "@/lib/simulation/impact";
import { useDemoStore } from "@/lib/state/demo-provider";
import { availability } from "@/lib/market/filters";
import { useLocalToday } from "@/lib/market/use-local-today";
import { transactionConditionError } from "@/lib/simulation/transaction";
export function TransactionSimulation({ asset, buyerNeedId }: { asset: Asset; buyerNeedId?: string }) {
  const demo = useDemoStore(); const today = useLocalToday();
  const [open, setOpen] = useState(false); const [confirming, setConfirming] = useState(false); const [success, setSuccess] = useState(false);
  const need = demo.status === "ready" && buyerNeedId ? demo.data.buyerNeeds.find(item => item.id === buyerNeedId) : undefined;
  const [price, setPrice] = useState(String(asset.askingPrice)); const [sellerCost, setSellerCost] = useState("0"); const [shipping, setShipping] = useState("0"); const [reference, setReference] = useState(""); const [source, setSource] = useState(""); const [error, setError] = useState("");
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validAmount(price) || Number(price) <= 0) return setError("시뮬레이션 거래금액은 0원보다 큰 정수로 입력해 주세요.");
    if (!validAmount(sellerCost) || !validAmount(shipping)) return setError("부담 비용과 운송비는 0원 이상의 정수로 입력해 주세요.");
    if (reference && (!validAmount(reference) || Number(reference) <= 0)) return setError("비교용 신품 가격은 비워 두거나 0원보다 큰 정수로 입력해 주세요.");
    if (source.trim() && !reference) return setError("비교 가격의 근거를 입력하려면 비교용 신품 가격도 입력해 주세요.");
    if (source.length > 120) return setError("비교 가격의 근거는 120자 이내로 입력해 주세요.");
    if (buyerNeedId && !need) return setError("연결된 구매 조건을 찾을 수 없습니다. 매칭 화면에서 다시 장비를 선택해 주세요.");
    const draft: DemoTransaction = { id: "pending", assetId: asset.id, ...(buyerNeedId ? { buyerNeedId } : {}), transactionPrice: Number(price), sellerCost: Number(sellerCost), buyerShippingCost: Number(shipping), ...(reference ? { referenceNewPrice: Number(reference) } : {}), ...(source.trim() ? { comparisonSource: source.trim() } : {}), completedAt: today, simulated: true };
    const conditionError = transactionConditionError(asset, draft, need, today);
    if (conditionError) return setError(conditionError);
    setError(""); setConfirming(true);
  }
  function complete() {
    if (demo.status !== "ready") { setError("브라우저 데이터를 불러온 뒤 다시 시도해 주세요."); setConfirming(false); return; }
    if (buyerNeedId && !need) { setConfirming(false); setError("연결된 구매 조건을 찾을 수 없습니다. 매칭 화면에서 다시 장비를 선택해 주세요."); return; }
    const transaction: DemoTransaction = { id: crypto.randomUUID(), assetId: asset.id, ...(buyerNeedId ? { buyerNeedId } : {}), transactionPrice: Number(price), sellerCost: Number(sellerCost), buyerShippingCost: Number(shipping), ...(reference ? { referenceNewPrice: Number(reference) } : {}), ...(source.trim() ? { comparisonSource: source.trim() } : {}), completedAt: today, simulated: true };
    const conditionError = transactionConditionError(asset, transaction, need, today);
    if (conditionError) { setConfirming(false); setError(conditionError); return; }
    if (demo.completeTransaction(transaction, today)) { setSuccess(true); setOpen(false); setConfirming(false); setError(""); }
    else { setConfirming(false); setError("저장하지 못했습니다. 이미 완료되었거나 기한이 지났는지, 브라우저 저장 공간을 확인해 주세요. 입력한 금액은 유지됩니다."); }
  }
  const available = availability(asset, today) === "AVAILABLE" && (!buyerNeedId || !!need);
  return <section className="detail-section simulation-section" id="simulation"><h2>거래 완료 시뮬레이션</h2><p className="simulation-warning">본 기능은 공모전 시연용 거래 시뮬레이션이며 실제 매매나 결제가 이루어지지 않습니다.</p><p>입력값은 이 브라우저에만 저장되는 가상 사례입니다. 비교용 신품 가격도 가정한 금액이며 실제 시세를 보장하지 않습니다.</p>{buyerNeedId && need && <p className="simulation-conditions">연결된 조건: {need.itemType ?? "품목 미확인"} · 예산 {need.maxBudget.toLocaleString("ko-KR")}원(거래금액+운송비) · 인수 희망 {need.desiredPickupDate}</p>}{success ? <div className="simulation-success" role="status"><strong>가상 거래 완료 사례가 저장되었습니다.</strong><p>실제 거래나 결제는 이루어지지 않았습니다.</p><Link href="/impact" className="button button-secondary">가상 정책 효과 확인</Link></div> : !available ? <div className="simulation-disabled">{buyerNeedId && !need ? "연결된 구매 조건이 없습니다. 매칭 화면에서 다시 선택해 주세요." : asset.status === "COMPLETED" ? "이미 가상 완료 처리된 장비입니다." : "현재 거래 가능 상태이며 처분 기한이 지나지 않은 장비만 시뮬레이션할 수 있습니다."}</div> : <>{!open ? <button type="button" className="button button-primary" onClick={() => setOpen(true)}>거래 시뮬레이션 시작</button> : <form className="simulation-form" onSubmit={validate} noValidate><fieldset disabled={confirming} className="simulation-fields"><div className="form-grid"><div className="form-field"><label htmlFor="sim-price">시뮬레이션 거래금액 *</label><div className="price-input"><input id="sim-price" inputMode="numeric" maxLength={15} value={price} onChange={e => setPrice(e.target.value)} /><span>원</span></div></div><div className="form-field"><label htmlFor="sim-seller">판매자 부담 비용 *</label><div className="price-input"><input id="sim-seller" inputMode="numeric" maxLength={15} value={sellerCost} onChange={e => setSellerCost(e.target.value)} /><span>원</span></div></div><div className="form-field"><label htmlFor="sim-shipping">구매자 운송비 *</label><div className="price-input"><input id="sim-shipping" inputMode="numeric" maxLength={15} value={shipping} onChange={e => setShipping(e.target.value)} /><span>원</span></div></div><div className="form-field"><label htmlFor="sim-reference">비교용 신품 가격 <span>(선택)</span></label><div className="price-input"><input id="sim-reference" inputMode="numeric" maxLength={15} value={reference} onChange={e => setReference(e.target.value)} /><span>원</span></div></div><div className="form-field full"><label htmlFor="sim-source">비교 가격의 근거 <span>(선택)</span></label><input id="sim-source" value={source} onChange={e => setSource(e.target.value)} maxLength={120} placeholder="예: 임의로 설정한 시연 기준가" /></div></div></fieldset>{error && <p className="field-error" role="alert">{error}</p>}{!confirming ? <div className="simulation-actions"><button type="button" className="button button-secondary" onClick={() => { setOpen(false); setError(""); }}>취소</button><button type="submit" className="button button-primary">입력 내용 확인</button></div> : <div className="simulation-confirm" role="group" aria-label="가상 거래 완료 확인"><strong>이 내용으로 가상 완료 처리할까요?</strong><p>거래금액 {Number(price).toLocaleString("ko-KR")}원 · 판매자 비용 {Number(sellerCost).toLocaleString("ko-KR")}원 · 운송비 {Number(shipping).toLocaleString("ko-KR")}원</p><p>실제 결제나 거래는 발생하지 않습니다.</p><div className="simulation-actions"><button type="button" className="button button-secondary" onClick={() => setConfirming(false)}>수정하기</button><button type="button" className="button button-primary" onClick={complete}>가상 완료 확정</button></div></div>}</form>}</>}{error && !open && !success && <p className="field-error" role="alert">{error}</p>}</section>;
}
