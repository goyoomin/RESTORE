import Link from "next/link";
import { ArrowRight, Handshake, Recycle, Sprout } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";

const steps = [
  ["참여자 모집과 안내", "지자체·지원기관이 후보 참여자를 모집하고, 운영 주체가 개인정보·자산 확인, 운송비, 일정, 분쟁 대응 범위를 설명합니다."],
  ["자산 확인과 수요 연결", "소유권과 기본 작동 상태를 확인하고 품목·지역·처분일을 등록합니다. 창업자 수요와 조건을 비교한 뒤 당사자가 인수 조건을 확인합니다."],
  ["인수 확인과 사후 조사", "실증에서 거래를 진행한다면 동의를 받아 인수와 비용을 증빙합니다. 이후 판매자·구매자 설문과 분쟁 여부를 확인하고, 미성사 사유도 기록합니다."],
];

const budget = [
  ["운영 인력", "담당 역할별 투입 인월 × 실제 적용할 기관 인건비 기준. 모집·상담, 자산 검토, 매칭 조정, 정산·평가 시간을 구분합니다."],
  ["플랫폼과 보안", "기능 개발·접근성 점검의 견적 + 운영 기간의 호스팅·유지보수 비용. 기존 시스템을 재사용하는 범위와 신규 구축 범위를 나눠 산정합니다."],
  ["현장 확인·운송", "확인 대상 자산 수 × 점검 단가 + 실제 이동 건수 × 지역·거리별 운송 견적. 지원 여부와 상한은 정책 결정 및 견적 확인 후 정합니다."],
  ["모집·교육·상담", "설명회·교육 횟수 × 회당 장소·자료·강사 비용 + 참여자 상담 시간 × 적용 인건비 기준."],
  ["효과 평가·개인정보", "설문·자료 검증·분석 인력 투입 시간과 필요한 개인정보·보안 검토 비용. 참여 동의와 최소 수집 원칙을 반영합니다."],
];

const kpis = [
  ["실제 거래 성사율", "실제 인수 확인을 마친 건수 ÷ 유효 자산 등록 건수. 시뮬레이션은 분자에서 제외합니다."],
  ["판매자 순회수액", "증빙한 실제 거래금액 − 판매자 부담 비용. 평균과 중앙값, 전체 분포를 함께 봅니다."],
  ["구매자 설비 비용 차이", "사전에 정한 비교 기준의 신규 구매비 − 실제 거래금액 − 구매자 운송비. 설치·수리비 등은 별도 수집하지 않으면 제외 사실을 밝힙니다."],
  ["연결부터 인수까지 기간", "매칭 조건 확인일에서 실제 인수 확인일까지의 일수. 완료·미완료 건을 분리해 봅니다."],
  ["만족도와 분쟁", "동의한 참여자 설문 점수와 확인된 분쟁 건수 ÷ 실제 거래 건수. 표본 수와 응답률도 함께 공개합니다."],
  ["자산 재사용", "실제 인수 확인 건수와 자산 유형을 기록합니다. 환경 편익 환산은 별도 기준과 자료를 검증한 뒤 계산합니다."],
];

export default function PolicyPage() {
  return <main className="policy-page"><section className="matching-hero"><Container><span className="eyebrow">ABOUT RE:STORE</span><h1>한 가게의 자산이<br />다른 가게의 시작으로.</h1><p>폐업과 창업의 사이에서 자원의 쓰임을 이어가는 정책 아이디어입니다.</p></Container></section><Container><div className="policy-content">
    <div className="policy-notice">공모전 시연용 프로토타입입니다. 아래 운영·기관 역할·비용은 검토를 위한 제안이며 실제 협약, 예산 편성, 사업 운영 또는 성과를 뜻하지 않습니다.</div>
    <section className="policy-section policy-intro"><div><SectionHeading eyebrow="WHY RE:STORE" title={<>소중한 자산에<br />다음 기회를</>} /></div><div><p>가게를 정리하는 사장님에게 남은 집기와 설비는 회수가 필요한 자산입니다. 가게를 시작하는 사장님에게 설비 마련은 준비해야 할 비용입니다.</p><p>다시가게는 두 필요를 연결해 폐업 자산의 회수 기회와 창업 초기 비용 부담 완화의 가능성을 살펴봅니다. 자원이 지역 안에서 다시 쓰이는 방식도 함께 제안합니다.</p></div></section>
    <section className="policy-section policy-distinction"><SectionHeading eyebrow="POLICY APPROACH" title="거래를 넘어 회수와 재도약까지" /><div><p>일반적인 물품 거래 과정에 폐업 자산 회수와 창업 설비 부담 완화라는 정책 목적을 연결합니다. 조건 기반 추천, 가상 거래 기록과 비용 산식을 함께 제공해 향후 시범사업에서 무엇을 검증할지 보여줍니다.</p><p>현재 화면의 기록과 지표는 모두 가상이며, 실제 성과를 입증하지 않습니다.</p></div></section>
    <section className="policy-section"><SectionHeading eyebrow="POLICY VALUES" title="다시가게가 지향하는 가치" /><div className="policy-values"><article><Handshake size={24} /><h3>폐업 손실 완화</h3><p>사용 가능한 자산의 회수 기회를 넓힙니다.</p></article><article><Sprout size={24} /><h3>창업 부담 완화</h3><p>장비를 마련할 수 있는 선택지를 제공합니다.</p></article><article><Recycle size={24} /><h3>지역 자원순환</h3><p>지역에서 남은 자산의 새로운 쓰임을 찾습니다.</p></article></div><p className="policy-caption">위 항목은 정책의 제안 목표이며 실제로 측정된 효과가 아닙니다.</p></section>
    <section className="policy-section"><SectionHeading eyebrow="PILOT SCOPE PROPOSAL" title="작게 시작해 검증하는 시범사업" description="아래 규모와 지역은 운영 방식을 구체화하기 위한 가정입니다. 참여기관·대상·예산은 확정되지 않았습니다." /><div className="policy-proposal-note"><strong>제안 시나리오:</strong> 경기도 내 1개 시·군에서 6개월 운영, 폐업 예정 점포 최대 50곳과 예비 창업자·기존 소상공인 최대 50명 모집을 가정합니다. 후보 지역은 모집 기반, 지원기관 접근성, 이동 거리 등을 조사해 협의로 정하며, 특정 시·군이 선정되었거나 참여를 확정했다는 뜻이 아닙니다.</div><p>참여자는 폐업을 앞두고 재사용 가능한 장비를 보유한 소상공인과, 일정 기간 내 점포 개업 또는 설비 교체를 준비하는 소상공인으로 제안합니다. 실제 자격·기간·품목은 유관기관 검토 후 확정해야 합니다.</p></section>
    <section className="policy-section"><SectionHeading eyebrow="PILOT OPERATIONS" title="단계별 운영 과정" /><ol className="policy-steps">{steps.map(([title, description]) => <li key={title}><strong>{title}</strong><p>{description}</p></li>)}</ol></section>
    <section className="policy-section"><SectionHeading eyebrow="PROPOSED RESPONSIBILITIES" title="기관과 참여자의 역할" description="아래는 협의가 필요한 역할 제안이며, 현재 협약이나 기관별 수행을 확인한 내용이 아닙니다." /><div className="policy-roles">
      <div><strong>경기신용보증재단<br />(연계 역할 제안)</strong><p>폐업·재도전 관련 상담과 창업 준비 지원으로 연결할 수 있는 안내 경로를 검토합니다. 실제 사업, 지원 조건, 보증 심사와 자동 연계는 전제하지 않으며 운영 전 공식 자료와 담당 부서 확인이 필요합니다.</p></div>
      <div><strong>경기도·시·군</strong><p>지역 수요와 참여자 모집, 기존 지원사업 안내, 장소·홍보 협력 가능성을 검토합니다. 예산 지원이나 참여 확정은 별도 의사결정 사항입니다.</p></div>
      <div><strong>소상공인 지원기관</strong><p>참여자 상담, 폐업·재창업 교육과 기존 제도 안내를 맡는 방안을 제안합니다. 다시가게 이용이 기존 지원 자격이나 선정에 영향을 주지 않도록 역할을 분리합니다.</p></div>
      <div><strong>운영 주체·전문업체</strong><p>자산 정보 관리, 매칭 조정, 소유권·기본 상태 확인 절차, 운송 견적 안내, 동의·민원·분쟁 접수를 운영합니다. 점검·운송은 자격과 보험, 책임 범위를 확인한 업체와 별도 계약하는 방안입니다.</p></div>
      <div><strong>참여 소상공인</strong><p>자산 또는 수요 정보를 제공하고 상태·비용·인수 여부를 확인합니다. 실제 실증은 충분한 설명과 자발적 동의, 개인정보 최소 수집을 전제로 합니다.</p></div>
    </div></section>
    <section className="policy-section"><SectionHeading eyebrow="COST ESTIMATION PROPOSAL" title="비용은 항목과 단가를 확인해 산정합니다" description="현재 승인된 예산이나 실제 견적은 없습니다. 금액을 임의로 정하지 않고, 제안된 6개월·최대 50개 점포 시나리오를 기준으로 산식을 제시합니다." /><dl className="policy-budget">{budget.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl><p className="policy-caption">총 사업비 산식 제안 = 운영 인력 + 플랫폼·보안 + 현장 확인·운송 + 모집·교육·상담 + 효과 평가·개인정보 검토. 단가는 실제 견적과 적용 가능한 공공 인건비·조달 기준을 확인한 뒤 확정하며, 중복 편익이나 미확정 지원금을 비용에서 임의로 차감하지 않습니다.</p></section>
    <section className="policy-section"><SectionHeading eyebrow="EXISTING PROGRAM LINKAGE" title="기존 지원정책과 연결하는 방법" description="특정 사업에 이미 연계되거나 선정된 것은 아닙니다." /><div><p>운영 전 경기신용보증재단, 경기도·시·군 및 소상공인 지원기관의 최신 공식 안내를 확인해 폐업 상담, 재창업 교육, 경영 컨설팅 등 실제 운영 중인 지원 경로를 조사합니다. 참여자가 원할 때 담당 기관의 연락 방법이나 신청 정보를 안내하는 추천·의뢰 방식부터 검토합니다.</p><p>사업 간 자격·지원 중복 여부, 개인정보 전달 동의, 책임 주체를 각각 확인해야 합니다. 다시가게 등록만으로 지원 대상이 되거나 보증·대출이 승인되는 구조는 제안하지 않습니다.</p></div></section>
    <section className="policy-section"><SectionHeading eyebrow="MEASUREMENT PLAN" title="실제 성과는 이렇게 검증합니다" description="다음 지표는 실증 단계에서 동의와 증빙을 확보해 측정할 제안입니다. 현재 대시보드의 시연 수치는 여기에 포함되지 않습니다." /><div className="policy-kpis">{kpis.map(([title, description]) => <article key={title}><strong>{title}</strong><p>{description}</p></article>)}</div><p className="policy-caption">보고서에는 모집·등록·매칭·실제 인수의 단계별 분모, 중도 이탈, 응답률, 비용과 측정 한계를 함께 공개합니다. 판매자 회수액과 구매자 절감액을 더해 총 편익으로 표시하지 않습니다.</p></section>
    <section className="policy-section policy-final"><div><span className="eyebrow">MEASURE WHAT MATTERS</span><h2>가정과 성과를 구분해<br />정책 가능성을 살펴봅니다.</h2><p>가상 거래의 회수액과 구매비 추정 차액을 각각 계산하고, 실증에서는 실제 거래 성사율·순회수액·비용 절감액·소요 기간·만족도·분쟁률을 검증할 것을 제안합니다.</p></div><Link className="button button-primary" href="/impact">정책 효과 살펴보기 <ArrowRight size={16} /></Link></section>
    <p className="policy-caption">실제 사업화에는 기관 협의와 제도 적합성 검토, 인증·개인정보 보호, 자산 소유권 확인, 안전한 거래와 분쟁 대응, 비교 기준을 포함한 효과 검증이 필요합니다.</p>
  </div></Container></main>;
}
