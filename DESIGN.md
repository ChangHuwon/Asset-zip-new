# Asset.ZIP — Design Overview

Asset.ZIP은 가족이 함께 관리하는 공동자산(예금, 국내주식, 해외주식, 펀드/ETF)을 한 곳에서 확인할 수 있는 웹/앱 서비스다. 가족 구성원 각자가 자신이 담당하는 계좌 잔액을 수시로 입력하면, 대시보드에서 전체 자산 현황과 변동 추이를 확인할 수 있다.

## 한 줄 요약

"우리 가족 자산이 지금 얼마인지, 어떻게 변해왔는지를 가족 모두가 쉽게 볼 수 있는 공유 장부."

## 왜 만드는가

각자 다른 은행/증권사 앱에 흩어진 공동자산 정보를 취합하려면 매번 수동으로 계산해야 하는 번거로움이 있다. Asset.ZIP은 이 취합 과정을 상시 공유되는 대시보드로 대체한다.

## 핵심 설계 방향

1. **공동자산 전용** — 개인 자산은 다루지 않는다. 프라이버시 통제 설계가 필요 없다. (자세한 내용은 [core-beliefs.md](./design-docs/core-beliefs.md))
2. **수동 입력 우선** — 정확성과 단순함을 위해 자동 연동 없이 시작한다.
3. **원화 통일 표시** — 외화 자산도 입력 시점에 원화로 환산해 저장한다.
4. **가벼운 인프라** — Next.js + Vercel(PWA 배포) + Vercel Postgres/Neon. 별도 서버 운영 없이 관리형 서비스로만 구성한다.
5. **캐주얼 신뢰성 기준** — 가족 내부용 도구 수준의 품질/신뢰성 기준을 따른다. ([RELIABILITY.md](./RELIABILITY.md), [QUALITY_SCORE.md](./QUALITY_SCORE.md))
6. **Airbnb 디자인 시스템 기반** — 흰 캔버스 + 단일 포인트 컬러 + 부드러운 라운드라는 철학을 그대로 채택하되, 한글 폰트와 한국 금융 색상 관례(빨강=증가/파랑=감소)에 맞게 조정한다. ([FRONTEND.md](./FRONTEND.md))

## 문서 안내

| 문서 | 내용 |
|---|---|
| [design-docs/](./design-docs/index.md) | 설계 원칙과 배경 |
| [product-specs/](./product-specs/index.md) | 기능/화면별 상세 명세 |
| [PLANS.md](./PLANS.md) | 전체 개발 로드맵 |
| [exec-plans/](./exec-plans/) | 현재 진행 중/완료된 실행 계획 |
| [FRONTEND.md](./FRONTEND.md) | 프론트엔드 기술/디자인 규칙 |
| [PRODUCT_SENSE.md](./PRODUCT_SENSE.md) | 제품 판단 기준 |
| [QUALITY_SCORE.md](./QUALITY_SCORE.md) | 품질 기준 |
| [RELIABILITY.md](./RELIABILITY.md) | 신뢰성 원칙 |
| [SECURITY.md](./SECURITY.md) | 보안 원칙 |
| [generated/db-schema.md](./generated/db-schema.md) | DB 스키마 (자동 생성 예정) |
