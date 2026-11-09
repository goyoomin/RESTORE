import Link from "next/link";
import { ArrowRight, Handshake, Recycle, Sprout } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";

const phases = [
  ["1개월 차", "모집·운영 준비", "참여 안내와 동의 절차, 자산 확인 기준, 운송·분쟁 대응 경로를 준비합니다."],
  ["2–5개월 차 · 상시", "접수·자산 등록", "폐업·철거 일정에 맞춰 자산을 수시 접수합니다. 일괄 모집 기간이 끝날 때까지 기다리지 않습니다."],
  ["2–5개월 차 · 병행", "검수·매칭·인수", "등록 자산별로 확인 즉시 수요를 연결하고 인수 일정을 조율합니다. 철거 기한이 가까운 건은 우선 처리합니다."],
  ["6개월 차", "평가·정리", "성사·미성사 이유, 비용, 만족도, 분쟁 여부를 검토하고 결과와 한계를 정리합니다."],
];

const roles = [
  ["경기신용보증재단", "폐업·재도전 상담과 창업 준비 지원으로 이어지는 안내 경로를 검토하는 역할 제안. 실제 사업·지원 조건·보증 심사와 자동 연계를 전제하지 않습니다."],
  ["경기도·시·군", "지역 수요 조사, 참여자 모집과 홍보, 장소 협력 가능성을 검토합니다. 예산 지원이나 참여가 확정된 것은 아닙니다."],
  ["소상공인 지원기관", "폐업·재창업 상담, 교육, 확인된 기존 제도 안내를 맡는 방안을 제안합니다."],
  ["운영 주체·전문업체", "자산 정보·매칭·민원 접수를 운영하고, 점검·운송은 자격·보험·책임 범위를 확인한 업체와 별도 검토합니다."],
  ["참여자", "자산·수요와 비용 정보를 제공하고, 충분한 설명을 들은 뒤 자발적으로 참여 여부를 결정합니다."],
];

const kpis = [
  ["실제 거래 성사율", "실제 인수 확인 건수 ÷ 유효 자산 등록 건수. 시뮬레이션은 제외합니다."],
  ["판매자 순회수액", "증빙한 거래금액 − 판매자 부담 비용. 평균·중앙값과 분포를 함께 봅니다."],
  ["구매자 설비 비용 차이", "사전 합의한 비교 기준 − 거래금액 − 운송비. 설치·수리비가 미수집이면 제외 사실을 밝힙니다."],
  ["매칭부터 인수까지 기간", "조건 확인일부터 실제 인수일까지의 일수. 성사·미성사 사례를 나눠 봅니다."],
  ["만족도·분쟁률", "참여자 설문과 확인된 분쟁 건수 ÷ 실제 거래 건수. 표본 수와 응답률을 함께 공개합니다."],
  ["자산 재사용", "실제 인수 확인 건수와 자산 유형을 기록합니다. 환경 편익 환산은 검증된 방법이 있을 때만 합니다."],
];

export default function PolicyPage() {
  return <main className="policy-page">
    <section className="matching-hero"><Container><span className="eyebrow">ABOUT RE:STORE</span><h1>한 가게의 자산이<br />다른 가게의 시작으로.</h1><p>폐업과 창업의 사이에서 자원의 쓰임을 이어가는 정책 아이디어입니다.</p></Container></section>
    <Container><div className="policy-content">
      <div className="policy-notice">공모전 시연용 프로토타입입니다. 시범사업 규모·비용과 기관 역할은 검토를 위한 가정·제안이며 실제 협약, 예산 편성, 사업 운영 또는 성과를 뜻하지 않습니다.</div>

      <section className="policy-summary" aria-labelledby="pilot-summary-title">
        <div className="policy-summary-heading"><span className="eyebrow">PILOT AT A GLANCE · PROPOSAL</span><h2 id="pilot-summary-title">시범사업 한눈에 보기</h2><p>운영 모델을 구체화하기 위한 가정입니다. 대상·지역·기간은 협의 후 정해야 합니다.</p></div>
        <dl className="policy-summary-facts"><div><dt>대상 지역</dt><dd>경기도 내 1개 시·군</dd></div><div><dt>운영 기간</dt><dd>6개월</dd></div><div><dt>참여 규모 가정</dt><dd>판매자 최대 50곳<br />구매자 최대 50명</dd></div></dl>
        <ol className="policy-timeline" aria-label="6개월 시범사업 운영 과정">{phases.map(([period, title, description]) => <li key={period}><span>{period}</span><strong>{title}</strong><p>{description}</p></li>)}</ol>
        <p className="policy-caption">2–5개월 차에는 자산별 등록 이후 검수·매칭·인수 절차를 수시로 병행합니다. 정해진 매칭 기간까지 대기하지 않고, 폐업자의 철거 예정일이 임박한 자산을 우선 조율합니다. 실제 처리 기준과 목표 응답시간은 운영 주체·운송 여건 확인 후 정합니다. 지역은 참여자 기반, 지원기관 접근성, 이동 범위를 조사해 선정하며 특정 지역이나 기관 참여가 확정된 것은 아닙니다.</p>
      </section>

      <section className="policy-section policy-intro"><div><SectionHeading eyebrow="WHY RE:STORE" title={<>소중한 자산에<br />다음 기회를</>} /></div><div><p>폐업 소상공인에게 남은 집기·설비는 회수가 필요한 자산이고, 창업자에게는 시작 전에 마련해야 할 비용입니다.</p><p>다시가게는 두 필요를 연결해 자산 회수와 초기 비용 완화 가능성을 검토합니다. 이는 검증할 정책 가설이지 이미 입증된 효과가 아닙니다.</p></div></section>

      <section className="policy-section policy-distinction"><SectionHeading eyebrow="POLICY APPROACH" title="거래를 넘어 회수와 재도약까지" /><div><p>일반 물품 거래 과정에 폐업 자산 회수와 창업 설비 부담 완화라는 정책 목표를 연결합니다. 세부 품목 매칭, 가상 거래 기록과 효과 산식으로 실증에서 확인할 내용을 제안합니다.</p><p>현재 화면의 자산·거래·지표는 모두 가상입니다.</p></div></section>

      <section className="policy-section"><SectionHeading eyebrow="POLICY VALUES" title="다시가게가 지향하는 가치" /><div className="policy-values"><article><Handshake size={24} /><h3>폐업 손실 완화</h3><p>사용 가능한 자산의 회수 기회를 넓힙니다.</p></article><article><Sprout size={24} /><h3>창업 부담 완화</h3><p>장비를 마련할 선택지를 제공합니다.</p></article><article><Recycle size={24} /><h3>지역 자원순환</h3><p>지역에서 남은 자산의 새 쓰임을 찾습니다.</p></article></div><p className="policy-caption">제안 목표이며 실측된 성과가 아닙니다.</p></section>

      <section className="policy-section"><SectionHeading eyebrow="TARGET & ELIGIBILITY · PROPOSAL" title="참여 대상과 지역은 조사 후 정합니다" description="아래는 모집 계획을 세우기 위한 가정이며 확정된 자격이나 모집 공고가 아닙니다." /><div className="policy-proposal-note"><strong>대상 제안:</strong> 재사용 가능한 장비를 보유한 폐업 예정 소상공인과, 일정 기간 내 개업 또는 설비 교체를 준비하는 예비 창업자·기존 소상공인. 실제 자격, 품목, 기간과 증빙 기준은 참여 기관 협의 후 결정합니다.</div><p>후보 시·군은 잠재 참여자 수, 현장 지원기관 접근성, 운송 가능 범위, 지역 내 수요를 조사해 비교합니다. 특정 시·군은 선정된 바 없습니다.</p></section>

      <section className="policy-section"><SectionHeading eyebrow="PROPOSED RESPONSIBILITIES" title="역할 제안" description="기관 협약이나 실제 수행 현황을 뜻하지 않습니다." /><div className="policy-roles">{roles.map(([name, responsibility]) => <div key={name}><strong>{name}</strong><p>{responsibility}</p></div>)}</div></section>

      <section className="policy-section"><SectionHeading eyebrow="EXISTING PROGRAM LINKAGE" title="기존 지원정책과 연결하는 방법" description="실제 연계 전 최신 공식 안내와 담당 기관의 확인이 필요합니다." /><p>폐업 상담, 재창업 교육, 경영 컨설팅 등 운영 중인 지원 경로를 조사하고, 참여자가 원할 때 신청 정보나 담당 기관을 안내하는 자발적 의뢰 방식부터 검토합니다. 다시가게 등록만으로 기존 지원 자격이 생기거나 보증·대출이 승인되는 구조는 아닙니다. 자격 중복, 정보 제공 동의와 책임 주체도 사전에 확인해야 합니다.</p></section>

      <section className="policy-section policy-budget-section"><SectionHeading eyebrow="BUDGET MODEL · SEPARATE ESTIMATE" title="예산 산정과 성과 검증은 구분합니다" description="웹 화면에는 미확정 금액을 게시하지 않습니다. 비용 항목과 단가 산정식은 별도 문서에서 가정값·견적 필요 여부와 함께 제시합니다." /><div className="policy-budget-overview"><div><h3>예산 항목</h3><p>인건비 · 플랫폼 · 장비 확인 · 운송 · 홍보 · 효과 평가</p><p>수량과 실제 단가를 확인한 뒤 합산합니다. 미조사 단가는 확정 예산으로 보지 않습니다.</p></div><div><h3>성과 검증</h3><p>실제 거래 성사율 · 판매자 순회수액 · 구매자 비용 차이 · 소요 기간 · 만족도 · 분쟁률</p><p>동의와 증빙을 확보해 측정하며, 시뮬레이션 수치는 실증 성과에서 제외합니다.</p></div></div></section>

      <section className="policy-section"><SectionHeading eyebrow="MEASUREMENT PLAN" title="성과는 분모와 한계를 함께 공개합니다" description="아래는 실증 단계 측정 제안입니다. 현재 대시보드의 가상 수치와 다릅니다." /><div className="policy-kpis">{kpis.map(([title, description]) => <article key={title}><strong>{title}</strong><p>{description}</p></article>)}</div><p className="policy-caption">모집·등록·매칭·실제 인수의 단계별 건수, 미성사·중도 이탈, 응답률과 비용을 함께 공개합니다. 판매자 회수액과 구매자 절감액을 더해 총 편익으로 표시하지 않습니다.</p></section>

      <section className="policy-section policy-final"><div><span className="eyebrow">MEASURE WHAT MATTERS</span><h2>가정과 성과를 구분해<br />정책 가능성을 살펴봅니다.</h2><p>실제 사업화에는 기관 협의, 제도 적합성 검토, 개인정보 보호, 자산 확인, 거래 안전과 분쟁 대응, 비교 기준을 포함한 실증이 필요합니다.</p></div><Link className="button button-primary" href="/impact">정책 효과 살펴보기 <ArrowRight size={16} /></Link></section>
    </div></Container>
  </main>;
}
