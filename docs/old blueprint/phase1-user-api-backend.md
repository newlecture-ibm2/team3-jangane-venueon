# 🔐 Phase 1 — User API (BE): 회원가입/로그인 JWT 발급

> **브랜치:** `feature/{이슈번호}-user-auth-api`  
> **담당:** Backend  
> **목표:** 회원가입 / 로그인 API 구현 + JWT 토큰 발급 + `/auth/me` 사용자 정보 조회

---

## 📋 참고 문서

- [jwt-auth-flow.md](./jwt-auth-flow.md) — JWT 인증 흐름 분석
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) — Git 브랜치/커밋 규칙

---

## 🏗️ 구현 파일 목록 (헥사고날 아키텍처)

### 1. Security 인프라 (JWT 관련)

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 1 | `common/config/SecurityConfig.java` | 기존 파일 수정 — JWT 필터 등록, 경로별 권한 설정 |
| 2 | `user/adapter/in/security/JwtTokenProvider.java` | JWT 토큰 생성/검증/파싱 (HS256, jjwt 라이브러리) |
| 3 | `user/adapter/in/security/JwtAuthenticationFilter.java` | 매 요청마다 JWT 추출 → 인증 설정 (OncePerRequestFilter) |
| 4 | `user/adapter/in/security/CustomUserDetailsService.java` | UserDetailsService 구현 — DB에서 사용자 조회 |

### 2. Application Port (비즈니스 인터페이스)

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 5 | `user/application/port/in/SignUpUseCase.java` | 회원가입 유스케이스 (Port-In) |
| 6 | `user/application/port/in/LoginUseCase.java` | 로그인 유스케이스 (Port-In) |
| 7 | `user/application/port/in/GetUserInfoUseCase.java` | 사용자 정보 조회 유스케이스 (Port-In) |
| 8 | `user/application/port/out/UserRepositoryPort.java` | 사용자 저장/조회 인터페이스 (Port-Out) |

### 3. Application Service (비즈니스 로직)

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 9 | `user/application/service/AuthService.java` | 회원가입/로그인 비즈니스 로직 (@UseCase) |

### 4. Adapter Out — Persistence

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 10 | `user/adapter/out/persistence/UserPersistenceAdapter.java` | UserRepositoryPort 구현체 — JPA 연동 |
| 11 | `user/adapter/out/persistence/UserMapper.java` | UserJpaEntity ↔ User 도메인 모델 변환 |

### 5. Adapter In — Presentation (Controller + DTO)

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 12 | `user/adapter/in/web/dto/SignUpRequest.java` | 회원가입 요청 DTO |
| 13 | `user/adapter/in/web/dto/LoginRequest.java` | 로그인 요청 DTO |
| 14 | `user/adapter/in/web/dto/LoginResponse.java` | 로그인 응답 DTO (token, username, role) |
| 15 | `user/adapter/in/web/dto/UserInfoResponse.java` | 사용자 정보 응답 DTO |
| 16 | `user/adapter/in/web/AuthController.java` | `/auth/signup`, `/auth/login`, `/auth/me` 엔드포인트 |

---

## 📐 API 스펙

### POST `/auth/signup` — 회원가입

```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "사용자",
  "role": "USER"         // "USER" | "HOST"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "사용자",
    "role": "USER"
  }
}
```

### POST `/auth/login` — 로그인 (JWT 발급)

```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@example.com",
  "nickname": "사용자",
  "role": "USER"
}
```

### GET `/auth/me` — 사용자 정보 조회 (JWT 필요)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```
```json
// Response (200 OK)
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "사용자",
  "role": "USER"
}
```

---

## 🔧 구현 순서 (커밋 단위 권장)

### Step 1 — JWT 인프라 구성
```
커밋: feat: JWT 토큰 발급/검증 클래스 구현 (#이슈번호)
```
- `JwtTokenProvider.java` — `generateToken()`, `validateToken()`, `getEmailFromToken()` 구현
- `application-dev.properties`의 `jwt.secret`, `jwt.expiration` 확인

### Step 2 — Port/Service 레이어 구현
```
커밋: feat: User Auth Port/Service 구현 (#이슈번호)
```
- Port-In: `SignUpUseCase`, `LoginUseCase`, `GetUserInfoUseCase`
- Port-Out: `UserRepositoryPort`
- Service: `AuthService` — BCrypt 비밀번호 암호화, 이메일 중복 체크, JWT 발급 위임

### Step 3 — Persistence Adapter 구현
```
커밋: feat: User Persistence Adapter 구현 (#이슈번호)
```
- `UserPersistenceAdapter` — `save()`, `findByEmail()`, `existsByEmail()` 구현
- `UserMapper` — Entity ↔ Domain 변환

### Step 4 — Controller/DTO + Security 필터 통합
```
커밋: feat: Auth Controller + JWT 필터 통합 (#이슈번호)
```
- DTO 클래스 생성
- `AuthController` — 3개 엔드포인트
- `JwtAuthenticationFilter` — `OncePerRequestFilter` 상속
- `CustomUserDetailsService` — `loadUserByUsername()` 구현
- `SecurityConfig` 수정 — JWT 필터 등록, 경로별 인가 규칙 추가

---

## ✅ 푸시 전 검증 체크리스트

### 1단계: 컴파일 확인

```bash
cd backend
./gradlew compileJava
```
- [ ] 컴파일 에러 없이 BUILD SUCCESSFUL

### 2단계: 애플리케이션 기동 확인

```bash
# DB 없이 테스트할 경우 H2 임시 사용 또는 Docker DB 실행
docker compose -f docker-compose.local.yml up db -d

cd backend
./gradlew bootRun
```
- [ ] 서버 정상 기동 (port 8080)
- [ ] 콘솔에 에러 로그 없음

### 3단계: Swagger UI 확인

```
http://localhost:8080/swagger-ui.html
```
- [ ] `/auth/signup`, `/auth/login`, `/auth/me` 엔드포인트가 표시됨

### 4단계: curl/Postman으로 API 테스트

```bash
# ① 회원가입
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","nickname":"테스터","role":"USER"}'

# 기대: 201 Created + 사용자 정보 반환

# ② 이메일 중복 가입 시도
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","nickname":"테스터2","role":"USER"}'

# 기대: 409 Conflict 또는 400 Bad Request (이메일 중복 에러)

# ③ 로그인
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# 기대: 200 OK + JWT 토큰 반환
# 반환된 token 값을 복사

# ④ JWT로 사용자 정보 조회
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer {위에서_받은_JWT_토큰}"

# 기대: 200 OK + 사용자 정보(email, nickname, role) 반환

# ⑤ 잘못된 JWT로 요청
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer invalid.jwt.token"

# 기대: 401 Unauthorized

# ⑥ JWT 없이 보호된 경로 요청
curl -X GET http://localhost:8080/auth/me

# 기대: 401 Unauthorized
```

### 5단계: 아키텍처 준수 확인

- [ ] Domain 모델(`User.java`)에 JPA 어노테이션 없음 (기존 유지)
- [ ] Service에서 JpaRepository 직접 참조 없음 → Port-Out만 의존
- [ ] Controller에 비즈니스 로직 없음 → UseCase 호출만
- [ ] `SecurityConfig`에서 `/auth/signup`, `/auth/login` → `permitAll()`
- [ ] `SecurityConfig`에서 `/auth/me` → `authenticated()`

### 6단계: 최종 확인

- [ ] `./gradlew clean build` — 전체 빌드 성공
- [ ] 불필요한 `System.out.println` 제거
- [ ] `@Slf4j` 로거로 디버그 로그 작성

---

## 🔀 브랜치 작업 흐름

```bash
# 1. master에서 브랜치 생성
git switch master
git pull origin master
git switch -c feature/{이슈번호}-user-auth-api

# 2. 위 Step 1~4 순서로 개발 + 커밋

# 3. 전체 검증 통과 후 푸시
git push origin feature/{이슈번호}-user-auth-api

# 4. GitHub에서 PR 생성
#    제목: feat: User API 회원가입/로그인 JWT 발급 (#이슈번호)
#    본문에 closes #이슈번호 포함
```

---

## ⚠️ 주의사항

- `jwt.secret`은 **최소 32자 이상** (HS256 요구사항)
- `application-dev.properties`에 이미 `${JWT_SECRET:...}` 환경변수 설정이 있으므로 그대로 사용
- 비밀번호는 반드시 **BCryptPasswordEncoder**로 암호화 후 저장
- Spring Boot 4.x에서 `SecurityFilterChain` 설정 방식 확인 (DSL 기반)
