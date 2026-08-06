# DB Schema

> **상태**: exec-plan 01 구현 중. 이 파일은 `web/prisma/schema.prisma`와 동기화됨.
> 실제 마이그레이션 기반 스키마는 `web/prisma/schema.prisma`가 진실의 원천(source of truth).

## 구현된 테이블 구조 (Prisma schema 기준)

### Family
| 필드 | 타입 | 설명 |
|---|---|---|
| id | String (cuid) | PK |
| name | String | 가족 그룹 이름 (예: 우리집) |
| inviteCode | String (unique) | 8자 영숫자 랜덤, 혼동 문자(0/O/1/l/I) 제외 |
| createdAt | DateTime | |

### Member
| 필드 | 타입 | 설명 |
|---|---|---|
| id | String (cuid) | PK |
| familyId | String (FK → Family) | |
| displayName | String | (familyId, displayName) unique |
| pinHash | String | bcrypt 해시, 평문 저장 금지 |
| failedAttempts | Int (default 0) | rate limit 카운터 |
| lockedUntil | DateTime? | 5회 실패 시 5분 잠금 |
| createdAt | DateTime | |

### AssetCategory
| 필드 | 타입 | 설명 |
|---|---|---|
| id | String (cuid) | PK |
| familyId | String (FK → Family) | |
| name | String | 예금 / 국내주식 / 해외주식 / 펀드/ETF |
| sortOrder | Int | 정렬 순서 |

### Account
| 필드 | 타입 | 설명 |
|---|---|---|
| id | String (cuid) | PK |
| familyId | String (FK → Family) | |
| categoryId | String (FK → AssetCategory) | |
| name | String | 계좌 이름 (예: OO은행 공동통장) |
| currency | String (default KRW) | 원래 통화 참고용 (저장값은 항상 KRW) |
| createdAt | DateTime | |

### Entry
| 필드 | 타입 | 설명 |
|---|---|---|
| id | String (cuid) | PK |
| accountId | String (FK → Account) | |
| memberId | String (FK → Member) | 입력자 |
| amountKrw | BigInt | 원화 정규화 금액 |
| originalAmount | Decimal? | 외화 입력 시 원래 금액 |
| originalCurrency | String? | 외화 코드 |
| fxRateUsed | Decimal? | 적용 환율 |
| recordedAt | DateTime | |

## 설계 메모
- Entry는 스냅샷 이력으로 쌓임 — 대시보드는 계좌별 최신 entry 합산
- 정정 입력 = 새 entry 추가 (기존 수정/삭제 없음)
- Rate limit: Member.failedAttempts >= 5 → 5분 lockedUntil

## 런타임 설정
- ORM: Prisma v7 (driver adapters 방식)
- 어댑터: `@prisma/adapter-pg` + `pg`
- URL: `process.env.DATABASE_URL` (Neon/Vercel Postgres)
