# 🖥️ Phase 2 — 로그인/가입 페이지 (FE): UI + API 연동

> **브랜치:** `feature/{이슈번호}-auth-frontend`  
> **담당:** Frontend  
> **선행 조건:** Phase 1 (`feature/{이슈번호}-user-auth-api`) 머지 완료  
> **목표:** 로그인/회원가입 UI 구현 + BFF Route를 통한 백엔드 JWT 인증 연동

---

## 📋 참고 문서

- [jwt-auth-flow.md](./jwt-auth-flow.md) — JWT 인증 흐름 (BFF 패턴)
- [phase1-user-api-backend.md](./phase1-user-api-backend.md) — 백엔드 API 스펙
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) — Git 브랜치/커밋 규칙

---

## 🔑 핵심 아키텍처: BFF(Backend For Frontend) 인증 패턴

> **브라우저는 JWT를 절대 알지 못합니다.**

```
[브라우저]  →  [Next.js BFF 서버]  →  [Spring Boot]
           POST /api/auth/login    POST /auth/login
           ← { user 정보 }         ← { token: JWT }
           (JWT는 iron‑session     (JWT를 BFF에게만 줌)
            쿠키에 암호화 저장)
```

- 프론트엔드 클라이언트 코드에서 `api.post('/auth/login', ...)` 호출
- Next.js `/api/auth/login/route.ts` (BFF Route)가 Spring Boot로 대신 요청
- Spring Boot가 JWT 반환 → BFF가 iron-session 쿠키에 암호화 저장
- 브라우저에겐 사용자 정보만 반환 (JWT 노출 안 됨✅)

---

## 🏗️ 구현 파일 목록

### 1. BFF API Route (Next.js 서버사이드)

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 1 | `src/app/api/auth/signup/route.ts` | 회원가입 BFF Route — Spring Boot 대신 호출 |
| 2 | `src/app/api/auth/login/route.ts` | 로그인 BFF Route — JWT 수신 → iron-session 저장 |
| 3 | `src/app/api/auth/logout/route.ts` | 로그아웃 BFF Route — 세션 파기 |
| 4 | `src/app/api/auth/session/route.ts` | 세션 조회 Route — 현재 로그인 상태 확인 |

### 2. 클라이언트 컴포넌트 (UI)

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 5 | `src/app/(auth)/login/page.tsx` | 로그인 페이지 (기존 파일 수정) |
| 6 | `src/app/(auth)/signup/page.tsx` | 회원가입 페이지 (기존 파일 수정) |
| 7 | `src/app/(auth)/auth.module.css` | 로그인/회원가입 공용 스타일 |

### 3. 인증 상태 관리

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 8 | `src/lib/auth-api.ts` | 인증 관련 API 호출 함수 (클라이언트용) |
| 9 | `src/lib/useAuth.ts` | Zustand 인증 상태 스토어 (로그인 상태, 사용자 정보) |

### 4. 미들웨어 수정

| 순서 | 파일 경로 | 역할 |
|------|-----------|------|
| 10 | `src/middleware.ts` | 기존 파일 확인 — 보호 경로 설정 유지 |

---

## 📐 BFF Route 상세 스펙

### POST `/api/auth/signup` — 회원가입 BFF

```typescript
// route.ts 내부 동작:
// 1. 브라우저로부터 { email, password, nickname, role } 수신
// 2. Spring Boot POST /auth/signup 으로 대신 요청
// 3. 성공 시 → Spring Boot 응답을 브라우저에 그대로 전달
// 4. 실패 시 → 에러 메시지 전달
```

### POST `/api/auth/login` — 로그인 BFF (핵심!)

```typescript
// route.ts 내부 동작:
// 1. 브라우저로부터 { email, password } 수신
// 2. Spring Boot POST /auth/login 으로 대신 요청
// 3. Spring Boot가 { token, email, nickname, role } 반환
// 4. GET /auth/me 호출 (JWT 헤더 포함) → 사용자 상세 정보 획득
// 5. iron-session에 JWT + 사용자 정보 암호화 저장
// 6. 브라우저에겐 { user: { nickname, email, role } } 만 반환

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const API_BASE = process.env.API_BASE_URL || "http://backend:8080";

  // ① Spring Boot에 로그인 요청
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!loginRes.ok) {
    const error = await loginRes.json().catch(() => ({}));
    return Response.json(error, { status: loginRes.status });
  }

  const loginData = await loginRes.json();
  // loginData = { token: "eyJ...", email: "...", nickname: "...", role: "..." }

  // ② JWT로 사용자 정보 조회
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });
  const userData = meRes.ok ? await meRes.json() : loginData;

  // ③ iron-session에 JWT + 사용자 정보 저장
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.jwt = loginData.token;
  session.email = userData.email;
  session.nickname = userData.nickname;
  session.role = userData.role;
  session.userId = userData.id;
  session.isLoggedIn = true;
  await session.save();

  // ④ 브라우저에겐 JWT 없이 사용자 정보만 반환
  return Response.json({
    user: {
      email: userData.email,
      nickname: userData.nickname,
      role: userData.role,
    },
  });
}
```

### POST `/api/auth/logout` — 로그아웃 BFF

```typescript
// route.ts 내부 동작:
// 1. iron-session 세션 파기 (session.destroy())
// 2. { success: true } 반환
```

### GET `/api/auth/session` — 세션 조회

```typescript
// route.ts 내부 동작:
// 1. iron-session 복호화해서 사용자 정보 확인
// 2. 로그인 상태면 { isLoggedIn: true, user: { ... } } 반환
// 3. 비로그인이면 { isLoggedIn: false } 반환
```

---

## 🔧 구현 순서 (커밋 단위 권장)

### Step 1 — BFF API Route 구현
```
커밋: feat: Auth BFF Route 구현 (login/signup/logout/session) (#이슈번호)
```
- `/api/auth/signup/route.ts`
- `/api/auth/login/route.ts` — JWT → iron-session 저장 (위 코드 참고)
- `/api/auth/logout/route.ts` — 세션 파기
- `/api/auth/session/route.ts` — 세션 조회

### Step 2 — 인증 API 유틸 + Zustand 스토어
```
커밋: feat: 인증 API 유틸 및 상태 관리 구현 (#이슈번호)
```
- `src/lib/auth-api.ts` — 클라이언트에서 BFF Route를 호출하는 함수
  ```typescript
  export const authAPI = {
    signup: (data) => fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (email, password) => fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => fetch('/api/auth/logout', { method: 'POST' }),
    getSession: () => fetch('/api/auth/session').then(r => r.json()),
  };
  ```
- `src/lib/useAuth.ts` — Zustand 스토어
  ```typescript
  // 상태: user, isLoggedIn, isLoading
  // 액션: login(), logout(), checkSession()
  ```

### Step 3 — 로그인/회원가입 UI 구현
```
커밋: feat: 로그인/회원가입 페이지 UI 구현 (#이슈번호)
```
- `src/app/(auth)/login/page.tsx` — 폼 UI + authAPI.login() 연동
- `src/app/(auth)/signup/page.tsx` — 폼 UI + authAPI.signup() 연동 + 역할 선택(USER/HOST)
- `src/app/(auth)/auth.module.css` — 공용 스타일

### Step 4 — 네비게이션 연동
```
커밋: feat: 로그인 상태 기반 네비게이션 표시 (#이슈번호)
```
- Header/Navigation에 로그인 상태 반영
- 로그인 시: 닉네임 표시 + 로그아웃 버튼
- 비로그인 시: 로그인/회원가입 링크 표시

---

## ✅ 푸시 전 검증 체크리스트

### 사전 준비

```bash
# Phase 1 머지된 master 반영
git switch master
git pull origin master
git switch feature/{이슈번호}-auth-frontend
git merge master

# 백엔드 실행 (Phase 1 API 필요)
cd backend
./gradlew bootRun &

# 프론트엔드 실행
cd frontend
npm install
npm run dev
```

### 1단계: 빌드 확인

```bash
cd frontend
npm run build
```
- [ ] 빌드 에러 없음
- [ ] TypeScript 타입 에러 없음

### 2단계: 페이지 접근 확인

```
http://localhost:3000/login    → 로그인 페이지 렌더링
http://localhost:3000/signup   → 회원가입 페이지 렌더링
```
- [ ] 로그인 페이지가 정상 표시됨
- [ ] 회원가입 페이지가 정상 표시됨
- [ ] 스타일이 올바르게 적용됨

### 3단계: 회원가입 테스트

1. `/signup` 페이지 접속
2. 이메일, 비밀번호, 닉네임 입력 + 역할 선택(USER)
3. 가입 버튼 클릭
- [ ] 성공 시 로그인 페이지로 이동 (또는 성공 메시지 표시)
- [ ] 실패 시 에러 메시지 표시 (이메일 중복 등)
- [ ] 빈 필드 제출 시 유효성 검증 동작

### 4단계: 로그인 테스트

1. `/login` 페이지 접속
2. 가입한 이메일/비밀번호 입력
3. 로그인 버튼 클릭
- [ ] 성공 시 메인 페이지(`/`)로 이동
- [ ] 브라우저 DevTools → Application → Cookies에서 `venueon_session` 쿠키 확인
- [ ] 쿠키가 httpOnly로 설정됨 (JavaScript에서 접근 불가)
- [ ] 네비게이션에 로그인한 사용자 정보 표시
- [ ] 잘못된 비밀번호 입력 시 에러 메시지 표시

### 5단계: 세션 유지 확인

1. 로그인 상태에서 페이지 새로고침 (F5)
- [ ] 로그인 상태 유지됨 (세션 쿠키 기반)
2. 보호된 경로 접근 테스트
- [ ] 로그인 상태: `/mypage` 접근 가능
- [ ] 비로그인 상태: `/mypage` → `/login?redirect=/mypage` 리다이렉트

### 6단계: 로그아웃 테스트

1. 로그아웃 버튼 클릭
- [ ] `venueon_session` 쿠키 삭제됨
- [ ] 네비게이션이 비로그인 상태로 변경
- [ ] 보호된 경로 접근 시 로그인 페이지로 리다이렉트

### 7단계: BFF 보안 검증

```bash
# 브라우저 콘솔 (F12)에서 직접 확인:
document.cookie
# → venueon_session이 보이지 않아야 함 (httpOnly)
```
- [ ] JWT가 브라우저 JavaScript에서 접근 불가
- [ ] 브라우저 Network 탭에서 `/api/auth/login` 응답에 JWT 토큰이 없음
- [ ] 브라우저 Network 탭에서 API 요청 시 Authorization 헤더가 노출되지 않음

### 8단계: Catch-all 프록시 JWT 주입 확인

```bash
# 로그인 상태에서 보호된 API 호출 테스트
# 브라우저 Network 탭에서 확인:
# /api/events (또는 다른 API) 요청 →
#   → Next.js 서버가 자동으로 Authorization: Bearer JWT 주입
#   → 백엔드가 정상 응답
```
- [ ] 기존 catch-all 프록시(`/api/[...path]/route.ts`)가 정상 동작
- [ ] JWT가 자동으로 백엔드 요청에 주입됨

---

## 🔀 브랜치 작업 흐름

```bash
# 1. Phase 1 머지 후 master 최신화
git switch master
git pull origin master
git switch -c feature/{이슈번호}-auth-frontend

# 2. 위 Step 1~4 순서로 개발 + 커밋

# 3. 전체 검증 통과 후 푸시
git push origin feature/{이슈번호}-auth-frontend

# 4. GitHub에서 PR 생성
#    제목: feat: 로그인/가입 페이지 UI + BFF 인증 연동 (#이슈번호)
#    본문에 closes #이슈번호 포함
```

---

## ⚠️ 주의사항

- `/api/auth/*` Route는 **catch-all 프록시(`/api/[...path]/route.ts`)보다 우선** 적용됨 (Next.js 라우팅 규칙)
- `iron-session` v8 사용 중 — `cookies()` 함수에 `await` 필요 (Next.js 16 App Router)
- `SESSION_SECRET`은 `.env`에 이미 설정됨 (`session.ts`에서 참조)
- Zustand 스토어는 **클라이언트 컴포넌트**에서만 사용 (`"use client"` 필수)
- 회원가입 폼에서 비밀번호 **최소 길이 검증** 추가 권장 (프론트 + 백엔드 둘 다)
