# 계정관리 (Members) 스킬

## 개요
가족 그룹 내 멤버를 조회·삭제·PIN 초기화하는 관리자 전용 기능.

## 접근 경로
대시보드 헤더 → **계정관리** 버튼 (관리자 `isOwner` 계정에만 표시)  
URL: `/settings/members`

## 주요 파일
| 파일 | 역할 |
|------|------|
| `web/src/app/settings/members/page.tsx` | 서버 컴포넌트 — 멤버 목록 조회, 권한 검사 |
| `web/src/app/settings/members/member-list.tsx` | 클라이언트 컴포넌트 — 삭제/PIN초기화 UI + 토스트 |
| `web/src/actions/auth.ts` | `deleteMember`, `resetMemberPin` 서버 액션 |
| `web/src/app/dashboard/page.tsx` | 헤더에 "계정관리" 링크 (isOwner 조건부) |

## 기능 상세

### 멤버 목록
- 관리자(isOwner) 계정은 상단 고정, "관리자" 뱃지 표시
- 현재 로그인 계정은 "본인" 표시
- 소프트 삭제된 계정은 `displayName(계정삭제)` 형식으로 회색 표시 (액션 버튼 없음)

### 삭제 (소프트 삭제)
- 물리 삭제 대신 소프트 삭제: 내역 데이터를 보존하면서 계정 비활성화
- `displayName` → `${displayName}(계정삭제)` 으로 변경
- `pinHash` → 무작위 32바이트 hex값으로 교체 (로그인 차단)
- `failedAttempts`, `lockedUntil` 초기화
- 제한: 자기 자신, 관리자 계정은 삭제 불가
- 확인 단계: "삭제" 클릭 → "정말 삭제?" 인라인 확인 → "확인" 클릭

### PIN 초기화
- 임시 PIN `111111` 로 세팅
- `failedAttempts`, `lockedUntil` 초기화 (잠금 해제)
- 동일 PIN이 다른 사용자에게 이미 사용 중이면 오류
- 소프트 삭제된 계정은 초기화 불가

### 토스트 팝업
- 성공: 어두운 배경 + "✓ 메시지" — 아래서 슬라이드업
- 실패: 오렌지 배경 + "✕ 메시지"
- 3.5초 후 자동 소멸

## 권한
- 페이지 자체: `isOwner` 아니면 `/dashboard` 리다이렉트
- 각 액션: `verifySession().isOwner` 서버사이드 재검증

## 확장 고려 사항
- 복구 기능 (소프트 삭제 취소): `displayName`에서 `(계정삭제)` 제거 + 새 PIN 설정
- 멤버 초대/재초대
- 멤버별 접근 권한 세분화
