# 🧪 Phase 3 — 인증 연동 검증: 가입→로그인→JWT E2E 테스트

> **브랜치:** `feature/{이슈번호}-auth-e2e-verify`  
> **선행 조건:** Phase 1, Phase 2 모두 머지 완료  
> **목표:** 전체 인증 흐름이 정상 동작하는지 End-to-End 검증 + 엣지 케이스 테스트

---

## 📋 참고 문서

- [jwt-auth-flow.md](./jwt-auth-flow.md) — JWT 인증 흐름 전체
- [phase1-user-api-backend.md](./phase1-user-api-backend.md) — 백엔드 API 스펙
- [phase2-auth-frontend.md](./phase2-auth-frontend.md) — 프론트엔드 UI + BFF Route
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) — Git 브랜치/커밋 규칙

---

## 🎯 E2E 검증이란?

**End-to-End (E2E) 검증**은 사용자 관점에서 전체 시스템이 올바르게 동작하는지 확인합니다.

```
[사용자 브라우저] → [Next.js BFF] → [Spring Boot] → [PostgreSQL DB]
      UI            Route/Proxy       Controller         데이터
      ↕                ↕                 ↕                 ↕
 폼 입력/제출     JWT 세션 관리      인증/인가 처리     사용자 저장/조회
```

Phase 1과 Phase 2를 각각 테스트했다면, Phase 3에서는 **전체 연결**이 끊김 없이 동작하는지 확인합니다.

---

## 🔧 테스트 환경 준비

### 전체 시스템 기동

```bash
# 1. master 최신화 (Phase 1, 2가 모두 머지된 상태)
git switch master
git pull origin master
git switch -c feature/{이슈번호}-auth-e2e-verify

# 2. DB 기동
docker compose -f docker-compose.local.yml up db -d

# 3. 백엔드 기동
cd backend
./gradlew bootRun &
# 확인: http://localhost:8080/swagger-ui.html 접근 가능

# 4. 프론트엔드 기동
cd frontend
npm install
npm run dev
# 확인: http://localhost:3000 접근 가능
```

- [ ] DB 정상 기동 (`docker ps`로 확인)
- [ ] 백엔드 정상 기동 (8080 포트)
- [ ] 프론트엔드 정상 기동 (3000 포트)

---

## ✅ E2E 테스트 시나리오

### 시나리오 1: 정상 회원가입 → 로그인 → 인증된 API 사용

```
1. 브라우저에서 http://localhost:3000/signup 접속
2. 아래 정보로 회원가입:
   - 이메일: e2e-user@test.com
   - 비밀번호: test1234
   - 닉네임: E2E테스터
   - 역할: USER
3. 가입 성공 확인 → 로그인 페이지 이동
4. http://localhost:3000/login 에서 로그인
   - 이메일: e2e-user@test.com
   - 비밀번호: test1234
5. 로그인 성공 → 메인 페이지 이동
6. 네비게이션에 "E2E테스터" 닉네임 표시 확인
7. http://localhost:3000/mypage 접근 → 정상 표시 (로그인 상태)
8. 페이지 새로고침 → 로그인 상태 유지 확인
```

**검증 포인트:**
- [ ] 회원가입 성공
- [ ] 로그인 성공 + 자동 리다이렉트
- [ ] 사용자 정보 정상 표시 (닉네임)
- [ ] 보호된 페이지 접근 가능
- [ ] 새로고침 후 세션 유지

---

### 시나리오 2: HOST 역할 회원가입 → 로그인

```
1. http://localhost:3000/signup 에서 HOST로 가입
   - 이메일: host@test.com
   - 비밀번호: host1234
   - 닉네임: 기획자
   - 역할: HOST
2. 로그인 후 사용자 정보의 role이 "HOST"인지 확인
```

**검증 포인트:**
- [ ] HOST 역할로 가입 성공
- [ ] 로그인 시 role = "HOST" 반환

---

### 시나리오 3: 로그아웃 → 보호 경로 차단

```
1. 로그인 상태에서 로그아웃 클릭
2. 네비게이션이 비로그인 상태로 변경 확인
3. http://localhost:3000/mypage 접근 시도
4. → /login?redirect=/mypage 로 리다이렉트 확인
5. 다시 로그인 → /mypage로 자동 이동 (redirect 파라미터 반영)
```

**검증 포인트:**
- [ ] 로그아웃 시 세션 파기
- [ ] 보호 경로 접근 차단 → 로그인 리다이렉트
- [ ] redirect 파라미터가 정상 동작

---

### 시나리오 4: 에러 케이스 — 잘못된 비밀번호

```
1. http://localhost:3000/login 접속
2. 존재하는 이메일 + 잘못된 비밀번호 입력
3. 로그인 버튼 클릭
4. → 에러 메시지 표시 (e.g., "이메일 또는 비밀번호가 올바르지 않습니다")
```

**검증 포인트:**
- [ ] 적절한 에러 메시지 표시
- [ ] 로그인 상태가 변경되지 않음
- [ ] 세션 쿠키가 생성되지 않음

---

### 시나리오 5: 에러 케이스 — 이메일 중복 가입

```
1. http://localhost:3000/signup 접속
2. 이미 가입된 이메일로 다시 가입 시도
3. → 에러 메시지 표시 (e.g., "이미 등록된 이메일입니다")
```

**검증 포인트:**
- [ ] 중복 이메일 에러 처리
- [ ] 적절한 에러 메시지 표시

---

### 시나리오 6: 에러 케이스 — 존재하지 않는 이메일 로그인

```
1. http://localhost:3000/login 접속
2. 가입하지 않은 이메일로 로그인 시도
3. → 에러 메시지 표시
```

**검증 포인트:**
- [ ] 미존재 계정 에러 처리
- [ ] 보안을 위해 "이메일이 틀렸다"가 아닌 일반적인 에러 메시지 권장

---

### 시나리오 7: JWT 만료 처리

```
1. 로그인 성공 (정상 세션 획득)
2. 백엔드를 재시작 (또는 JWT secret을 변경)
3. 보호된 API 호출 시도
4. → 백엔드가 401 응답
5. → catch-all 프록시가 세션 자동 파기 (session.destroy())
6. → 다음 페이지 이동 시 로그인 페이지로 리다이렉트
```

**검증 포인트:**
- [ ] 401 응답 시 세션 자동 파기
- [ ] 사용자가 자연스럽게 재로그인 유도됨

---

### 시나리오 8: 동시 탭 세션 동기화

```
1. 탭 A에서 로그인
2. 탭 B를 새로 열기 → 로그인 상태 확인
3. 탭 A에서 로그아웃
4. 탭 B를 새로고침 → 로그아웃 상태 확인
```

**검증 포인트:**
- [ ] 쿠키 기반이므로 탭 간 세션 공유
- [ ] 로그아웃 시 모든 탭에 반영 (새로고침 후)

---

## 🔍 보안 검증 체크리스트

### BFF 보안 (프론트엔드)

```bash
# 브라우저 DevTools (F12) 확인
```

| 항목 | 확인 방법 | 기대 결과 |
|------|-----------|-----------|
| **JWT 클라이언트 노출** | Network 탭 → `/api/auth/login` 응답 Body | JWT 토큰이 **없어야** 함 |
| **httpOnly 쿠키** | Console → `document.cookie` | `venueon_session`이 **보이지 않아야** 함 |
| **쿠키 속성** | Application → Cookies | httpOnly: ✅, sameSite: lax |
| **Authorization 헤더** | Network 탭 → 일반 페이지 요청 | Authorization 헤더 **없어야** 함 |

### 백엔드 보안

```bash
# curl로 직접 검증
```

| 항목 | 테스트 커맨드 | 기대 결과 |
|------|--------------|-----------|
| **JWT 없이 /auth/me 접근** | `curl http://localhost:8080/auth/me` | 401 Unauthorized |
| **잘못된 JWT** | `curl -H "Authorization: Bearer fake" http://localhost:8080/auth/me` | 401 Unauthorized |
| **만료된 JWT** | (1초 만료 토큰 생성 후 대기) | 401 Unauthorized |
| **회원가입 허용경로** | `curl -X POST http://localhost:8080/auth/signup ...` | JWT 없이도 200/201 |
| **비밀번호 암호화** | DB 직접 조회: `SELECT password FROM users` | BCrypt 해시 (`$2a$...`) |

### DB 직접 확인

```bash
# Docker 컨테이너 내 psql 접속
docker exec -it venueon-db psql -U venueon -d venueon_prod

# 또는 docker-compose.local.yml의 DB 설정에 맞게
```

```sql
-- 가입한 유저 확인
SELECT id, email, nickname, role, created_at FROM users;

-- 비밀번호가 BCrypt 해시인지 확인
SELECT email, password FROM users;
-- password 값이 $2a$10$... 형태여야 함 (평문❌)
```

- [ ] 사용자 데이터가 정상 저장됨
- [ ] 비밀번호가 BCrypt로 암호화됨
- [ ] role이 올바르게 저장됨

---

## 📊 전체 흐름 체크 — curl 순차 테스트 스크립트

> 아래 스크립트를 터미널에서 순서대로 실행하여 전체 흐름을 자동 검증할 수 있습니다.

```bash
#!/bin/bash
# E2E 인증 흐름 검증 스크립트
# 사용법: bash docs/e2e-auth-test.sh

BACKEND="http://localhost:8080"
FRONTEND="http://localhost:3000"
EMAIL="e2e-$(date +%s)@test.com"
PASSWORD="testpass1234"
NICKNAME="E2E테스터"

echo "=========================================="
echo "🧪 VenueOn 인증 E2E 테스트 시작"
echo "=========================================="
echo "테스트 이메일: $EMAIL"
echo ""

# ① 회원가입 (백엔드 직접)
echo "--- ① 회원가입 ---"
SIGNUP_RES=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"nickname\":\"$NICKNAME\",\"role\":\"USER\"}")

SIGNUP_STATUS=$(echo "$SIGNUP_RES" | tail -1)
SIGNUP_BODY=$(echo "$SIGNUP_RES" | head -n -1)
echo "Status: $SIGNUP_STATUS"
echo "Body: $SIGNUP_BODY"

if [ "$SIGNUP_STATUS" = "201" ] || [ "$SIGNUP_STATUS" = "200" ]; then
  echo "✅ 회원가입 성공"
else
  echo "❌ 회원가입 실패"
  exit 1
fi
echo ""

# ② 이메일 중복 가입 시도
echo "--- ② 이메일 중복 가입 ---"
DUP_RES=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"nickname\":\"중복\",\"role\":\"USER\"}")

DUP_STATUS=$(echo "$DUP_RES" | tail -1)
echo "Status: $DUP_STATUS"

if [ "$DUP_STATUS" != "200" ] && [ "$DUP_STATUS" != "201" ]; then
  echo "✅ 중복 가입 차단됨"
else
  echo "❌ 중복 가입이 허용됨 — 에러!"
fi
echo ""

# ③ 로그인
echo "--- ③ 로그인 ---"
LOGIN_RES=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

LOGIN_STATUS=$(echo "$LOGIN_RES" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RES" | head -n -1)
echo "Status: $LOGIN_STATUS"

if [ "$LOGIN_STATUS" = "200" ]; then
  echo "✅ 로그인 성공"
  # JWT 토큰 추출 (jq 사용 가능 시)
  TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "JWT Token: ${TOKEN:0:50}..."
else
  echo "❌ 로그인 실패"
  exit 1
fi
echo ""

# ④ JWT로 /auth/me 호출
echo "--- ④ JWT로 사용자 정보 조회 ---"
ME_RES=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ME_STATUS=$(echo "$ME_RES" | tail -1)
ME_BODY=$(echo "$ME_RES" | head -n -1)
echo "Status: $ME_STATUS"
echo "Body: $ME_BODY"

if [ "$ME_STATUS" = "200" ]; then
  echo "✅ JWT 인증 성공"
else
  echo "❌ JWT 인증 실패"
fi
echo ""

# ⑤ 잘못된 JWT
echo "--- ⑤ 잘못된 JWT ---"
INVALID_RES=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND/auth/me" \
  -H "Authorization: Bearer invalid.jwt.token")

echo "Status: $INVALID_RES"
if [ "$INVALID_RES" = "401" ]; then
  echo "✅ 잘못된 JWT 거부됨"
else
  echo "❌ 잘못된 JWT가 허용됨 — 보안 문제!"
fi
echo ""

# ⑥ JWT 없이 접근
echo "--- ⑥ JWT 없이 보호 경로 접근 ---"
NO_JWT_RES=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND/auth/me")

echo "Status: $NO_JWT_RES"
if [ "$NO_JWT_RES" = "401" ]; then
  echo "✅ 인증 없는 접근 차단됨"
else
  echo "❌ 인증 없이 접근 가능 — 보안 문제!"
fi
echo ""

# ⑦ 잘못된 비밀번호 로그인
echo "--- ⑦ 잘못된 비밀번호 ---"
WRONG_PW_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrong_password\"}")

echo "Status: $WRONG_PW_RES"
if [ "$WRONG_PW_RES" = "401" ]; then
  echo "✅ 잘못된 비밀번호 거부됨"
else
  echo "❌ 잘못된 비밀번호로 로그인 성공 — 보안 문제!"
fi
echo ""

echo "=========================================="
echo "🧪 E2E 테스트 완료"
echo "=========================================="
```

---

## 🔧 구현 작업 (이 브랜치에서 할 일)

Phase 3 브랜치에서는 주로 **테스트/수정/문서화**를 진행합니다.

### Step 1 — E2E 테스트 스크립트 추가
```
커밋: test: 인증 E2E 테스트 스크립트 추가 (#이슈번호)
```
- `docs/e2e-auth-test.sh` — 위 curl 테스트 스크립트 파일화

### Step 2 — 발견된 버그 수정
```
커밋: fix: E2E 테스트에서 발견된 인증 버그 수정 (#이슈번호)
```
- Phase 1, 2에서 놓친 에지 케이스 수정
- 에러 메시지 통일
- 리다이렉트 로직 보완

### Step 3 — 인증 연동 문서 최종 업데이트
```
커밋: docs: 인증 연동 완료 — jwt-auth-flow.md 현행화 (#이슈번호)
```
- `jwt-auth-flow.md`에 VenueOn 프로젝트 기준으로 파일 경로 반영
- 실제 테스트 결과 기반으로 문서 보완

---

## ✅ 푸시 전 최종 검증 체크리스트

### 전체 시스템 동작

- [ ] `docker compose -f docker-compose.local.yml up db -d` — DB 기동
- [ ] `./gradlew bootRun` — 백엔드 정상 기동
- [ ] `npm run dev` — 프론트엔드 정상 기동

### E2E 시나리오 통과

- [ ] 시나리오 1: 정상 회원가입 → 로그인 → 인증 API
- [ ] 시나리오 2: HOST 역할 가입/로그인
- [ ] 시나리오 3: 로그아웃 → 보호 경로 차단
- [ ] 시나리오 4: 잘못된 비밀번호 에러 처리
- [ ] 시나리오 5: 이메일 중복 가입 에러 처리
- [ ] 시나리오 6: 미존재 이메일 로그인 에러 처리
- [ ] 시나리오 7: JWT 만료/무효화 처리
- [ ] 시나리오 8: 다중 탭 세션 동기화

### 보안 통과

- [ ] JWT가 브라우저에 노출되지 않음
- [ ] httpOnly 쿠키 정상 설정
- [ ] 비밀번호 BCrypt 해시 저장
- [ ] 인증 없는 보호 API 접근 차단 (401)

### 코드 품질

- [ ] `./gradlew clean build` — 백엔드 빌드 성공
- [ ] `npm run build` — 프론트엔드 빌드 성공
- [ ] 불필요한 console.log / System.out.println 제거
- [ ] E2E 테스트 스크립트 정상 동작

---

## 🔀 브랜치 작업 흐름

```bash
# 1. Phase 1, 2 머지 후 master 최신화
git switch master
git pull origin master
git switch -c feature/{이슈번호}-auth-e2e-verify

# 2. E2E 테스트 실행 + 버그 수정 + 문서 업데이트

# 3. 전체 검증 통과 후 푸시
git push origin feature/{이슈번호}-auth-e2e-verify

# 4. GitHub에서 PR 생성
#    제목: test: 인증 E2E 검증 완료 (#이슈번호)
#    본문에 closes #이슈번호 포함
```

---

## 📌 Phase 1~3 전체 요약

| Phase | 브랜치 | 핵심 산출물 | 검증 포인트 |
|-------|--------|------------|------------|
| **1. BE API** | `feature/{N}-user-auth-api` | JWT 발급 + Auth API | curl로 API 단위 테스트 |
| **2. FE UI** | `feature/{N}-auth-frontend` | 로그인/가입 UI + BFF Route | 브라우저 + DevTools 확인 |
| **3. E2E** | `feature/{N}-auth-e2e-verify` | 통합 테스트 + 보안 검증 | 전체 시나리오 + 자동 테스트 |

> 각 Phase는 **이전 Phase가 master에 머지된 후** 진행합니다.
