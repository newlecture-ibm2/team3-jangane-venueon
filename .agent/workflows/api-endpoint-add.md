# API 엔드포인트 추가

새로운 API 엔드포인트를 백엔드와 프론트엔드에 동시에 추가합니다.

## Steps

### 1. API 스펙 확인
- `docs/Architecture/API_스펙_v7.md` 참조
- 경로, Method, Auth, 요청/응답 구조 확인
- 코드 테이블 응답 여부 확인 (status, type → `{id, label}` 객체)

### 2. 백엔드 구현
- **Actor 판별:** 이 API는 누구의 기능인가?
  - 공통 조회 → Core `{domain}/adapter/in/web/`
  - Host 전용 → `host/{domain}/adapter/in/web/` + 경로 `/host/...`
  - Admin 전용 → `admin/{domain}/adapter/in/web/` + 경로 `/admin/...`
- **UseCase → Service → Port → Adapter** 순서로 구현
- Request/Response DTO는 `adapter/in/web/dto/`에 위치

### 3. 프론트엔드 연동
- BFF API Route 자동 프록시 확인 (`app/api/[...path]/route.ts`)
- 도메인별 API 함수 추가: `lib/api/{domain}API.ts`
- 응답 타입 정의 (v7 CodeDto 패턴 적용)

### 4. 프론트엔드 UI 연결
- 해당 페이지의 `_components/`에 UI 컴포넌트 생성
- 커스텀 훅으로 API 호출 + 상태 관리 분리
- 에러 처리: 공통 에러 코드 매핑 (`400`, `401`, `403`, `404`, `422`)

### 5. 검증
- 백엔드: `./gradlew compileJava && ./gradlew test`
- 프론트엔드: `npm run build`
- API 호출 테스트 (Swagger 또는 브라우저)
