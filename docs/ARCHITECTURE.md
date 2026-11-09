# 기술 및 데이터 설계

## 현재 구현

Next.js 16 App Router, React, TypeScript, Tailwind CSS, Lucide React를 사용한다. 화면 경로는 `/`, `/sell/new`, `/market`, `/market/[id]`, `/match`, `/impact`, `/policy`다. 자산·수요·가상 거래는 브라우저 `localStorage`에서 공유한다. 일반 시연은 서버 DB와 API 키가 필요하지 않다.

```text
app/                   App Router 페이지와 서버 API
components/            공통 UI 및 화면별 클라이언트 구성요소
lib/domain/            모델과 런타임 데이터 검증
lib/data/              상대 날짜를 쓰는 가상 초기 데이터
lib/repositories/      localStorage 저장소 경계와 버전 이전
lib/state/             DemoProvider 공유 상태
lib/matching/           규칙 기반 매칭 순수 함수
lib/simulation/         거래 조건·정책 효과 계산
lib/registration/       폼 검증과 사진 압축
lib/ai/                 선택형 서버 사진 분석
tests/                  단위 테스트와 Playwright E2E
```

서버와 첫 클라이언트 렌더는 같은 로딩 상태로 시작하고 브라우저 마운트 뒤 저장소를 읽는다. localStorage에 직접 접근하는 코드는 저장소 레이어로 제한한다.

## 데이터 모델과 마이그레이션

- **Asset:** `id`, `title`, `category`, `itemType?`, `description`, `condition`, `askingPrice`, `region`, `district`, `neighborhood?`, `disposalDeadline`, `status`, `image`, `createdAt`, `dataOrigin`. 새 등록은 카테고리에 속하는 세부 품목을 필수로 지정한다. `itemType` 누락은 이전 데이터에만 허용한다.
- **BuyerNeed:** `id`, `category`, `itemType?`, `maxBudget`, `preferredRegion`, `preferredDistrict`, `preferredNeighborhood?`, `desiredPickupDate`, `createdAt`. 새 조건은 세부 품목을 필수로 선택한다.
- **DemoTransaction:** `id`, `assetId`, `buyerNeedId?`, `transactionPrice`, `sellerCost`, `buyerShippingCost`, `referenceNewPrice?`, `comparisonSource?`, `completedAt`, `simulated: true`.
- **DemoStore:** `schemaVersion: 2`, 자산·수요·거래 배열, 선택적 관심 ID 배열.

현재 저장 키는 `restore-demo-v2`다. 저장 키 또는 객체가 v1이면 구조 검증 후 v2로 기록하며, 기존 키는 백업으로 남긴다. v1에 없던 품목을 임의 추정하지 않고 자산·이미지·가격·날짜·완료 거래·관심·수요를 보존한다. 용량 부족으로 변환본을 기록할 수 없으면 기존 v1은 삭제하지 않고 읽은 데이터를 메모리에서 사용할 수 있게 반환한다. 품목이 없는 자산은 정확 매칭 대상에서 제외된다. 자산 상세 화면에서 카테고리에 맞는 품목만 보완할 수 있고, 이 작업은 해당 자산의 `itemType`만 변경해 다른 필드와 거래 배열을 유지한다.

첫 방문과 초기화의 시드 자산 처분일 및 수요 인수일은 기준일에서 각각 정한 일수를 더해 만든다. 기존 저장 자산의 지난 날짜는 자동 갱신하지 않고 만료로 표시한다. 새로운 자산의 지난 처분일은 등록을 막는다.

금액은 음수가 아닌 안전한 정수 원화, 날짜는 유효한 `YYYY-MM-DD`다. 브라우저 저장값은 기기별이고 변조·삭제될 수 있다. localStorage는 서버 데이터베이스나 트랜잭션 잠금이 아니며 여러 탭의 동시 쓰기를 완전히 제어하지 못한다. 실제 개인정보와 자산 정보를 입력하지 않는다.

## 이미지 처리

시연 장비 그림은 `components/asset-image.tsx` 안에 직접 작성한 SVG 일러스트로, 외부 이미지 라이선스에 의존하지 않는다. 알 수 없는 이미지 식별자나 사진이 없는 입력에는 Lucide 아이콘을 표시한다. 사용자가 선택한 JPG·PNG·WebP는 브라우저에서 크기·용량을 줄여 data URL로 localStorage에 저장한다. 저장 공간은 브라우저마다 달라 저장 성공을 보장하지 않는다.

## 매칭

매칭 함수는 `lib/matching/match.ts`의 순수 함수다. 거래 가능 자산이고 기한이 지나지 않았는지, 경기도 자산인지, 카테고리와 세부 품목이 정확히 일치하는지, 예산과 희망 인수일이 맞는지 먼저 확인한다. 세부 품목이 없거나 다르면 추천에서 제외한다. 적합 품목 40점, 가격 15/20/25점, 지역 8/18/25점, 일정 5/7/10점을 합산해 최대 100점으로 표시한다. 이는 조건 기반 규칙 점수이며 거래 성공 확률이나 AI 분석이 아니다.

## 가상 거래 및 정책 효과

사용자가 확인한 뒤 완료 상태를 저장하기 직전 `transactionConditionError`가 자산 상태, 처분 기한, 등록 희망가, 거래 금액, 연결된 구매 조건의 품목, 거래금액+운송비 예산, 인수 희망일을 재검증한다. 자산별 완료 중복 기록을 막고 자산 상태와 거래 기록을 한 저장 객체에 기록한다. 실제 결제·매매는 발생하지 않는다.

완료된 시뮬레이션만 집계한다. 거래 총액·판매자 자산 회수액은 거래금액 합계이며, 판매자 순회수액은 거래금액에서 판매자 비용을 차감한다. 구매자 추정 차액은 비교 신품 가격에서 거래금액과 운송비를 차감하며, 기준가가 없으면 추정 불가, 결과가 음수면 추가 지출 가능성으로 표시한다. 설치·수리비 등은 제외한다. 입력 기준가는 사용자가 정한 시연 가정이며 실제 시세가 아니다. 판매자 회수액과 구매자 차액을 더해 총 편익이라고 주장하지 않는다. 별도 시범사업 가정 계산기는 저장된 시연 거래와 합산하지 않는다.

## AI 사진 분석

`/api/assets/analyze`는 서버에서 OpenAI Responses API를 호출한다. `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`, `ENABLE_AI_ANALYSIS=true`가 필요하고, 화면은 개발 환경에서만 버튼을 표시한다. 프로덕션 및 Vercel에서는 서버 설정이 있더라도 API 요청을 거부하고 화면에서 사용 불가 이유와 수동 입력 경로를 안내한다. 서버 키는 클라이언트에 전달하지 않는다. 인증 및 분산 요청 제한이 없으므로 배포 환경에서 AI를 공개 활성화하지 않는다. 분석은 사진을 외부로 전송하며, 사용자는 제안을 확인·수정한 뒤 적용한다.

## 확인 범위와 실서비스 전제

단위 테스트는 모델 검증, v1 이전, 기존 데이터 보존, 날짜·매칭·거래 경계와 효과 계산을 확인한다. Playwright는 등록·사진 선택, 마켓, 매칭, 가상 완료, 대시보드, 초기화 및 반응형 경로를 확인한다. 실제 서비스에는 인증·권한, 개인정보 보호, 자산 소유권과 상태 확인, 안전한 거래·분쟁 처리, 서버 DB·이미지 저장·동시성 제어가 추가로 필요하다.
