# Plans — Asset.ZIP 개발 로드맵

전체 로드맵의 최상위 목차. 각 단계의 상세 실행 계획은 [exec-plans/](./exec-plans/)에 개별 문서로 관리한다.

## Phase 1 — 공동자산 대시보드 + 수동 입력 (MVP)

- 가족 그룹 생성 및 초대코드 발급
- 초대코드 + 이름/PIN으로 가족 구성원 로그인
- 자산 카테고리(예금, 국내주식, 해외주식, 펀드/ETF) 기준 계좌 등록
- 계좌별 잔액 수동 입력 (외화는 입력 시 원화로 환산 저장)
- 대시보드: 총액 + 카테고리별 비중

→ 상세 실행 계획: [exec-plans/active/01-mvp-dashboard-and-manual-entry.md](./exec-plans/active/01-mvp-dashboard-and-manual-entry.md)

## Phase 2 — 추이 그래프 + 목표 추적

- 입력 이력을 시계열로 저장해 변동 추이 그래프 제공
- 목표 설정(예: 전세자금 목표) 및 진행률 표시

## Backlog (아직 확정되지 않음)

- 가족 알림/코멘트 기능
- 은행/증권사 자동 연동(오픈뱅킹, 스크래핑)
- 개인 자산 트래킹 (도입 시 core-beliefs.md의 "공동자산 전용" 원칙 재검토 필요)

## 로드맵 갱신 규칙

- 한 단계를 `exec-plans/active/`에서 `exec-plans/completed/`로 옮기기 전에, 반드시 [QUALITY_SCORE.md의 전체 기능 검증 루프](./QUALITY_SCORE.md#전체-기능-검증-루프-full-feature-verification-loop)를 통과해야 한다.
- 진행 중 발견된 기술 부채는 이 문서를 고치는 대신 [exec-plans/tech-debt-tracker.md](./exec-plans/tech-debt-tracker.md)에 기록한다.
