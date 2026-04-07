## Ticket
- **VO-559**: 구글 소셜 로그인 연동 (일반 회원가입/로그인)
- **VO-600**: 구글 로그인 기반 호스트 업그레이드 연동 (2단계 플로우)

## Description
본 PR은 VenueOn 플랫폼에 **Google Social Login (Google Identity Services)** 연동을 성공적으로 구현하고, 호스트 회원가입의 **2단계 플로우 (일반가입 -> 호스트 정보작성)** 기능을 완료한 작업입니다.

### 1. 구글 소셜 로그인
- **BFF (Backend-for-Frontend) Proxy**: `/api/auth/google` 구현. Google ID 토큰을 백엔드로 안전하게 전달
- **Backend Auth Flow (`AuthController`)**: 전달받은 ID Token을 검증 후 신규 유저는 자동 회원가입 처리, 기존 유저는 즉시 로그인 처리
- **Frontend Components**: `GoogleLoginButton` 구현
  - 로그인/회원가입/호스트가입 각 용도에 맞추어 `position`과 `redirectTo` prop 적용
  - Hydration mismatch와 SSR+CSR 이슈를 효과적으로 해결하기 위한 단계적 스크립트 로드 적용
  - 빌드 시 에러 방지(`useSearchParams` CSR 렌더 처리)를 위해 React Suspense 래핑 적용

### 2. 호스트 업그레이드 플로우 (2-Step)
- **Backend (`UpgradeToHostUseCase`)**: `POST /auth/host/upgrade` 라우트 구현
  - 일반 `USER` 권한 사용자가 추가 정보(기관명, 담당자명, 사업자번호 등)를 제공 시 `HOST`로 권한 갱신 및 `HostProfile` 생성
- **Frontend Flow**: 
  - 호스트 회원가입 페이지에서 구글 로그인 시 `/host-signup/complete` 로 리다이렉트 (회원정보 외 추가 정보만 입력하여 UX 개선)
  - BFF에 `/api/auth/host/upgrade` 라우트 생성 (세션내 JWT 포함하여 서버 요청 & 요청 성공 시 Session Update)

### 3. 헤더 UI 버그 픽스 및 로그인 관리
- `Header.tsx`: React Hydration 이후 Auth Store 상태를 정상적으로 활용하도록 `signedIn` 상태 결정 로직 보완
- 사용자 Action 분기점에 로그아웃 버튼 노출 보장

## To Reviewers
- 구글 로그인은 현재 개발환경에서 `application-dev.properties` 및 `.env` 등에서 발급받은 `GOOGLE_CLIENT_ID`가 필요합니다. 테스트를 위해 해당 변수를 확인해주세요.
- 추후 배포 파이프라인에서 Variable 지원을 하도록 `.github/workflows/deploy.yml` 에 `GOOGLE_CLIENT_ID` 환경 변수 주입 맵핑이 추가되었습니다! 
