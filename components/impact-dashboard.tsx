"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, RotateCcw } from "lucide-react";
import { CATEGORIES, type DemoStore } from "@/lib/domain/models";
import { buyerDifference, calculateImpact, calculateScenario, completedTransactions, type ScenarioInput } from "@/lib/simulation/impact";
import { redactContacts } from "@/lib/market/filters";
import { useDemoStore } from "@/lib/state/demo-provider";
import { Container } from "./ui";

const money = (amount: bigint) => `${amount.toLocaleString("ko-KR")}원`;
const count = (value: number | bigint) => `${value.toLocaleString("ko-KR")}건`;
function Difference({ value }: { value: bigint | null }) {
  if (value === null) return <>기준가 없어 추정 불가</>;
  if (value < 0n) return <>추가 지출 가능 {money(-value)}</>;
  return <>예상 절감 {money(value)}</>;
}
function Scenario() {
  const [values, setValues] = useState<ScenarioInput>({ shops: "", transactionsPerShop: "", recoveryPerTransaction: "", savingsPerTransaction: "" });
  const result = useMemo(() => calculateScenario(values), [values]);
  const fields: { key: keyof ScenarioInput; label: string; unit: string }[] = [
    { key: "shops", label: "예상 참여 점포 수", unit: "개" }, { key: "transactionsPerShop", label: "점포당 예상 거래 완료 건수", unit: "건" },
    { key: "recoveryPerTransaction", label: "건당 평균 자산 회수액", unit: "원" }, { key: "savingsPerTransaction", label: "건당 평균 창업자 구매비 절감액", unit: "원" },
  ];
  const invalid = Object.values(values).some(value => value !== "" && !/^\d{1,15}$/.test(value));
  return <section className="impact-scenario"><div className="impact-section-heading"><span className="eyebrow">WHAT IF</span><h2>시범사업 가정 기반 효과 시뮬레이션</h2><p>입력한 가정을 바탕으로 산출한 예시이며, 실제 사업 성과를 예측하거나 보장하지 않습니다.</p></div><div className="scenario-layout"><div className="scenario-form">{fields.map(field => <div className="form-field" key={field.key}><label htmlFor={`scenario-${field.key}`}>{field.label}</label><div className="price-input"><input id={`scenario-${field.key}`} type="text" inputMode="numeric" maxLength={15} placeholder="0 이상의 정수 입력" value={values[field.key]} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))} aria-invalid={values[field.key] !== "" && !/^\d{1,15}$/.test(values[field.key])} aria-describedby="scenario-help" /><span>{field.unit}</span></div></div>)}<p id="scenario-help" className={invalid ? "field-error" : "scenario-help"}>{invalid ? "각 항목에 0 이상의 정수를 입력해 주세요." : "모든 항목에 0 이상의 정수를 입력하면 결과가 갱신됩니다."}</p></div><div className="scenario-results" aria-live="polite"><span className="scenario-label">입력한 가정의 계산 결과</span><div><span>가정에 따른 총 거래 건수</span><strong>{result ? count(result.count) : "입력 필요"}</strong></div><div><span>가정에 따른 판매자 자산 회수액</span><strong>{result ? money(result.recovery) : "입력 필요"}</strong></div><div><span>가정에 따른 구매자 비용 절감액</span><strong>{result ? money(result.savings) : "입력 필요"}</strong></div><p>거래 건수 = 점포 수 × 점포당 건수. 각 금액 = 거래 건수 × 건당 평균 가정. 위 가상 거래 기록과 합산하지 않습니다.</p></div></div></section>;
}
const kpis = [
  ["등록 자산 중 실제 거래 성사율", "소유권과 실제 거래 완료를 확인한 뒤, 등록 자산 대비 성사 건수를 측정합니다."],
  ["거래에 성공한 판매자의 순회수액", "검증된 거래금액에서 판매자 부담 비용을 차감해 측정합니다."],
  ["구매자의 설비 구매비 절감액", "비교 기준가격과 구매·운송 비용을 확인하여 측정합니다."],
  ["매칭부터 거래까지 소요 기간", "실제 매칭 시점과 거래 완료 시점을 기록해 측정합니다."],
  ["참여자 만족도", "동의한 참여자의 설문 응답을 통해 측정합니다."],
  ["거래 관련 분쟁 발생률", "실제 거래 건수와 확인된 분쟁 건수를 기준으로 측정합니다."],
];
function StoredDashboard({ data }: { data: DemoStore }) {
  const impact = calculateImpact(data.transactions, data.assets);
  const transactions = completedTransactions(data.transactions, data.assets);
  const categories = CATEGORIES.map(category => ({ category, count: data.assets.filter(asset => asset.category === category).length }));
  const maxCategory = Math.max(1, ...categories.map(item => item.count));
  const metrics = [
    { label: "등록된 자산 수", value: count(data.assets.length), note: "가상 시드와 사용자 데모 자산 전체" },
    { label: "가상 완료 거래 수", value: count(impact.count), note: "유효한 완료 거래 기록 기준" },
    { label: "가상 거래 총액", value: money(impact.transactionTotal), note: "완료 거래의 거래금액 합계" },
    { label: "판매자 자산 회수액", value: money(impact.transactionTotal), note: "비용 차감 전 거래금액 합계" },
    { label: "판매자 순회수액", value: money(impact.sellerNet), note: "거래금액 − 판매자 부담 비용" },
    { label: "구매자 구매비 절감액", value: impact.comparableCount ? <Difference value={impact.estimatedSavings} /> : "추정 불가", note: `기준가 있는 ${impact.comparableCount}건의 순차액 · 누락 ${impact.unavailableCount}건` },
    { label: "장비 재사용 건수", value: count(impact.count), note: "가상 완료 자산 수 · 실제 재사용 아님" },
  ];
  return <><div className="impact-heading"><div><span className="eyebrow">THIS BROWSER ONLY</span><h2>가상 시연 핵심 지표</h2><p>현재 브라우저에 저장된 데이터만 사용합니다.</p></div></div><div className="impact-grid impact-metrics">{metrics.map(item => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><p>{item.note}</p></article>)}</div><p className="impact-footnote">구매자 차액은 비교 신품 가격 − 거래금액 − 구매자 운송비입니다. 음수 {impact.negativeSavingsCount}건은 추가 지출 가능성을 뜻하며 순차액에 음수로 반영됩니다. 비교 가격과 비용은 시연용 가정이고, 설치·수리비는 제외합니다. 거래 총액과 판매자 회수액은 같은 비용 차감 전 금액으로 중복 합산하지 않습니다.</p>
  <div className="impact-visual-grid"><section className="impact-panel"><div className="impact-section-heading"><span className="eyebrow">REGISTERED ASSETS</span><h2>카테고리별 등록 현황</h2><p>등록된 가상·사용자 데모 자산 기준</p></div><ul className="category-bars">{categories.map(item => <li key={item.category}><div><span>{item.category}</span><strong>{count(item.count)}</strong></div><div className="category-track" aria-hidden="true"><span style={{ width: `${item.count / maxCategory * 100}%` }} /></div></li>)}</ul></section><section className="impact-panel"><div className="impact-section-heading"><span className="eyebrow">DEMO FLOW</span><h2>등록 → 매칭 → 완료</h2><p>각 단계의 서로 다른 저장 데이터입니다.</p></div><div className="impact-flow"><div><span>01 등록 자산</span><strong>{count(data.assets.length)}</strong></div><ArrowRight size={18} aria-hidden="true" /><div><span>02 매칭 조건</span><strong>{count(data.buyerNeeds.length)}</strong></div><ArrowRight size={18} aria-hidden="true" /><div><span>03 가상 완료</span><strong>{count(impact.count)}</strong></div></div><p className="impact-footnote">매칭 단계는 시드와 사용자가 저장한 수요 조건 수입니다. 추천 노출·매칭 성사 건수는 기록하지 않아 측정할 수 없습니다. 단계별 대상이 달라 전환율로 해석할 수 없습니다.</p></section></div>
  <section className="impact-panel impact-history"><div className="impact-section-heading"><span className="eyebrow">SIMULATION RECORDS</span><h2>가상 거래 시뮬레이션 상세 내역</h2><p>완료 기록만 표시하며 실제 거래 내역이 아닙니다.</p></div>{transactions.length === 0 ? <div className="impact-empty"><p>아직 가상 완료 사례가 없습니다.</p><Link href="/market" className="button button-secondary">장비 둘러보기 <ArrowRight size={16} /></Link></div> : <div className="history-list">{transactions.map(item => { const asset = data.assets.find(a => a.id === item.assetId); const difference = buyerDifference(item); return <article className="history-card" key={item.id}><div className="history-title"><div><span className="eyebrow">가상 완료 · {item.completedAt}</span><h3>{asset ? redactContacts(asset.title) : "자산 정보 없음"}</h3></div><span className="history-tag">시뮬레이션</span></div><dl>{[["가상 거래금액", money(BigInt(item.transactionPrice))], ["판매자 부담 비용", money(BigInt(item.sellerCost))], ["판매자 순회수액", money(BigInt(item.transactionPrice) - BigInt(item.sellerCost))], ["구매자 운송비", money(BigInt(item.buyerShippingCost))], ["비교용 신품 가격", item.referenceNewPrice === undefined ? "입력 없음" : money(BigInt(item.referenceNewPrice))], ["비교 가격 근거", item.comparisonSource ? redactContacts(item.comparisonSource) : "입력 없음"], ["구매자 추정 차액", <Difference key="difference" value={difference} />]].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>비교 가격과 근거는 사용자가 입력한 시연용 가정입니다.</p></article>; })}</div>}</section></>;
}
export function ImpactDashboard() {
  const demo = useDemoStore();
  function reset() { if (window.confirm("이 브라우저의 모든 시연 자산, 수요, 관심 표시 및 가상 거래를 초기화할까요?")) demo.reset(); }
  return <main className="impact-page"><div className="matching-hero"><Container><span className="eyebrow">DEMO POLICY IMPACT</span><h1>다시가게가 만들어내는 변화</h1><p>가상 거래 기록과 가정으로 정책 효과의 측정 가능성을 살펴봅니다.</p></Container></div><Container><div className="impact-content"><div className="impact-notice"><BarChart3 size={22} /><div><strong>모든 기록은 이 브라우저의 가상 시연 데이터입니다.</strong><p>실제 거래 실적이나 측정된 정책 효과가 아닙니다. 입력한 가격과 비교 기준은 시연용 가정입니다.</p></div></div>{demo.status === "loading" && <p className="demo-state" role="status">가상 지표를 불러오는 중입니다.</p>}{demo.status === "error" && <div className="demo-state" role="alert">{demo.error} <button type="button" className="demo-reset" onClick={demo.refresh}>다시 불러오기</button> <button type="button" className="demo-reset" onClick={reset}>초기 데이터로 되돌리기</button></div>}{demo.status === "ready" && <><div className="impact-reset"><button className="demo-reset" type="button" onClick={reset}><RotateCcw size={15} /> 시연 데이터 초기화</button></div><StoredDashboard data={demo.data} /></>}<Scenario /><section className="impact-kpis"><div className="impact-section-heading"><span className="eyebrow">MEASUREMENT PLAN</span><h2>정책 성과는 이렇게 검증합니다</h2><p>아래 항목은 실제 데이터가 없어 추후 실증 단계에서 측정할 지표입니다.</p></div><div className="kpi-grid">{kpis.map(([title, description], index) => <article key={title}><span>0{index + 1} · 실증 단계 측정</span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="impact-footnote">실제 검증에는 참여자 동의, 거래·비용 확인, 적절한 비교 기준과 개인정보 보호가 필요합니다. 판매자 회수액과 구매자 절감액을 더해 총 편익으로 주장하지 않습니다.</p></section></div></Container></main>;
}
