# 금액 추이 (Trend) 기능 스킬

Asset.ZIP의 총 자산 금액 추이 차트 기능을 수정하거나 확장할 때 사용하는 가이드입니다.

## 파일 위치

| 파일 | 역할 |
|------|------|
| `web/src/app/trend/page.tsx` | 서버 컴포넌트 — 세션 검증, DB 조회, 스냅샷 계산 |
| `web/src/app/trend/trend-chart.tsx` | 클라이언트 컴포넌트 — Recharts 기반 Area 차트 |

진입점: 대시보드(`/dashboard`) 총액 카드 우측 하단의 "금액 추이 →" 버튼

## 데이터 흐름

```
URL ?period=1m (7d / 1m / 3m / 6m / 1y)
  → page.tsx: getPeriodDays() → fromDate, toDate, stepDays 결정
  → computeSnapshots(): DB에서 계좌별 전체 entry 조회 → 시간순 정렬
  → 날짜 루프(stepDays 간격): 그날까지 각 계좌의 최신 잔액을 Map으로 추적
  → DailySnapshot[] { date: string, totalKrw: number }
  → TrendChart에 props로 전달
```

## 핵심 알고리즘 (computeSnapshots)

- **"as-of-date" 방식**: 특정 날 기준으로 각 계좌의 마지막 잔액 합산
- Map\<accountId, amountKrw\>을 누적 갱신 → O(entries) 단일 패스
- 정렬 기준: `(valueDate ?? recordedAt) asc`, 동일 날짜면 `recordedAt asc`

## 기간별 샘플링 간격

| 기간 | 일수 | stepDays | 데이터포인트 |
|------|------|----------|------------|
| 7일  | 7    | 1        | ~7개       |
| 1개월 | 30  | 1        | ~30개      |
| 3개월 | 90  | 3        | ~30개      |
| 6개월 | 180 | 7        | ~26개      |
| 1년  | 365  | 14       | ~26개      |

## 수정 포인트

### 차트 색상 변경
`trend-chart.tsx` → `stroke="#ff385c"`, `stopColor="#ff385c"` 수정

### 새 기간 옵션 추가 (예: 2년)
1. `page.tsx` → `PERIOD_OPTIONS` 배열에 `{ value: "2y", label: "2년" }` 추가
2. `getPeriodDays()` switch에 `case "2y": return 730;` 추가
3. `getStepDays()` 조건에 730일에 대한 stepDays 추가 (예: 30)

### 계좌별 분리 차트
현재는 총합(totalKrw)만 표시. 카테고리별로 분리하려면:
- `computeSnapshots()`에서 계좌별 카테고리 정보도 join
- `DailySnapshot`에 `{ [categoryId]: number }` 추가
- `TrendChart`에서 복수의 `<Area>` 렌더링

### 대시보드 진입 버튼 위치
`web/src/app/dashboard/page.tsx` → 총액 카드 내부의 `<Link href="/trend">` 요소

## 의존성

- `recharts@^3` (React 19 호환)
- Prisma: `entry.findMany`, `account.findMany`
- 세션: `verifySession()` → `familyId`
