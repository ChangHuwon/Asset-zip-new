# Exec Plan 01 — MVP: 공동자산 대시보드 + 수동 입력

상태: 진행 중 (active)
연결 문서: [PLANS.md](../../PLANS.md) Phase 1, [product-specs/new-user-onboarding.md](../../product-specs/new-user-onboarding.md), [product-specs/asset-tracking.md](../../product-specs/asset-tracking.md)

## 목표

가족이 초대코드로 들어와서, 공동 계좌 잔액을 각자 입력하고, 대시보드에서 총액과 카테고리별 비중을 확인할 수 있는 상태를 만든다.

## 작업 항목

1. **프로젝트 초기화**
   - Next.js(App Router) 프로젝트 생성, Vercel 연결
   - Vercel Postgres/Neon 프로비저닝, 스키마 마이그레이션 도구 선정 (Prisma 권장)
2. **인증**
   - 가족 그룹 생성 + 초대코드 발급 로직 (표시 이름 중복 방지 포함 — generated/db-schema.md의 members unique 제약 참고)
   - 초대코드 + 이름/PIN 로그인 (PIN 해시 저장, rate limit 적용 — SECURITY.md 참고)
   - **세션 저장 + 자동 로그인** (재방문 시 초대코드/PIN 재입력 없이 로그인 — product-specs/new-user-onboarding.md 플로우 3, SECURITY.md의 세션 토큰 요구사항 참고). 로그아웃 시 세션을 즉시 무효화하는 로직도 함께 구현한다.
3. **자산 데이터 모델**
   - 카테고리(예금/국내주식/해외주식/펀드·ETF), 계좌, 잔액 입력 기록 테이블 설계 (generated/db-schema.md에 반영)
   - 외화 입력 시 원화 환산 로직 (환율 입력 또는 고정 환율 API 중 택1 — 구현 시점에 결정)
4. **입력 화면**
   - 계좌별 잔액 수동 입력 폼
   - 외화 입력 시 환산된 원화 금액 미리보기
5. **대시보드**
   - 총액 표시
   - 카테고리별 비중 (단순 차트 또는 리스트)
6. **PWA 설정**
   - manifest.json, 홈 화면 추가 지원 (FRONTEND.md 체크리스트 참고)

## 완료 기준 (Definition of Done)

- 가족 구성원이 초대코드로 로그인할 수 있고, 재방문 시 자동 로그인된다.
- 계좌를 등록하고 잔액을 입력할 수 있다 (외화 포함, 정정 입력 포함).
- 대시보드에서 정확한 총액과 카테고리별 비중이 보인다 (QUALITY_SCORE.md 기준: 금액 계산 정확성은 타협 불가).
- **[QUALITY_SCORE.md의 전체 기능 검증 루프](../../QUALITY_SCORE.md#전체-기능-검증-루프-full-feature-verification-loop)를 연속 2바퀴 무사히 통과했다.** 이 항목이 충족되기 전에는 completed로 옮기지 않는다.

## 완료 후

이 문서는 완료되면 `exec-plans/completed/`로 옮기고, Phase 2 계획을 `exec-plans/active/02-history-and-goals.md`로 새로 작성한다.
