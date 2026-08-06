# References

하네스(코딩 에이전트)가 매번 웹 검색하지 않고 바로 참고할 수 있도록, 이 프로젝트가 쓰는 기술의 압축된 레퍼런스(llms.txt 등)를 모아두는 곳이다.

## 현재 보유 중

- **[design-system-reference-llms.txt](./design-system-reference-llms.txt)** — Airbnb 디자인 시스템 원본 분석. 색상/타이포/spacing/radius/elevation/컴포넌트 토큰의 raw 값을 담고 있다. Asset.ZIP에 맞게 조정한 실제 정책(한글 폰트 대체, 색상 의미 재배정, 컴포넌트 매핑)은 이 파일이 아니라 [../FRONTEND.md](../FRONTEND.md)에 있다 — 토큰 값 자체가 궁금하면 이 파일을, "우리 프로젝트에서 어떻게 쓰는지"가 궁금하면 FRONTEND.md를 본다.

## 앞으로 추가하면 좋은 것

실제 구현이 시작되면 exec-plan 01 착수 시점에 다음 자료들을 이 폴더에 추가하는 것을 권장한다.

- **Next.js** (App Router 관례, 라우팅, 서버 컴포넌트)
- **Vercel 배포/PWA 설정** (manifest, 배포 환경변수 관리)
- **Vercel Postgres 또는 Neon** (연결 방식, 마이그레이션)
- **Prisma** (스키마 정의, 마이그레이션 명령어) — ORM으로 채택할 경우
- **Auth.js** (세션/쿠키 기반 인증 관례) — 인증 라이브러리로 채택할 경우

각 자료는 `references/<tool-name>-llms.txt` 형식의 파일명으로 저장하면 기존 네이밍과 일관된다.
