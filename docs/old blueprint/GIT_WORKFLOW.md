# 🔀 VenueOn Git 워크플로우 가이드

> **브랜치 전략:** GitHub Flow (간소화)  
> **머지 방식:** PR(Pull Request) → 팀장 검토(Review) → 승인 후 머지  
> **기반:** GitHub Issues + Milestones

---

## 📋 전체 흐름 요약

```
1. GitHub Issue 확인 (내 할당 이슈)
       ↓
2. 브랜치 생성 (이슈 번호 포함)
       ↓
3. 로컬에서 개발
       ↓
4. 커밋 (이슈 번호 포함)
       ↓
5. 푸쉬 → PR 생성
       ↓
6. 팀장 코드 리뷰
       ↓
7. 승인 → master에 머지
       ↓
8. 로컬 master 업데이트
```

---

## 🚀 Step 1: 작업 시작 — 브랜치 생성

### 최신 master를 먼저 받아온다
```bash
git switch master
git pull origin master
```

### 이슈 번호 기반으로 브랜치 생성
```bash
# 형식: feature/이슈번호-간단설명
git switch -c feature/12-user-api
```

**브랜치 네이밍 규칙:**

| 유형 | 형식 | 예시 |
|------|------|------|
| 기능 개발 | `feature/이슈번호-설명` | `feature/12-user-api` |
| 버그 수정 | `fix/이슈번호-설명` | `fix/25-login-error` |
| 문서 | `docs/이슈번호-설명` | `docs/5-erd-update` |

---

## 💻 Step 2: 개발 — 커밋하기

### 커밋 메시지 규칙
```bash
# 형식: 타입: 설명 (#이슈번호)
git commit -m "feat: User API 회원가입 구현 (#12)"
```

**커밋 타입:**

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: 이벤트 목록 API 구현 (#18)` |
| `fix` | 버그 수정 | `fix: 로그인 토큰 만료 처리 (#25)` |
| `refactor` | 리팩토링 | `refactor: OrderService Port 분리 (#30)` |
| `docs` | 문서 | `docs: API 스펙 업데이트 (#5)` |
| `style` | 코드 스타일 | `style: 들여쓰기 정리` |
| `chore` | 설정/빌드 | `chore: build.gradle 의존성 추가` |

> **💡 `#이슈번호`를 커밋에 넣으면** GitHub 이슈 페이지에 자동으로 해당 커밋이 링크됩니다!

### 커밋 단위
- ❌ 하루치를 한 번에 커밋하지 않기
- ✅ **의미 있는 단위**로 나눠서 커밋
  - `feat: User 도메인 모델 생성 (#12)`
  - `feat: User Port/Service 구현 (#12)`  
  - `feat: User Controller + DTO 구현 (#12)`
  - `feat: 로그인/가입 페이지 UI (#12)`

---

## 📤 Step 3: 푸쉬 → PR 생성

### 원격에 브랜치 푸쉬
```bash
git push origin feature/12-user-api
```

### GitHub에서 PR 생성

1. GitHub 저장소 페이지 접속
2. 상단에 뜨는 **"Compare & pull request"** 노란 버튼 클릭
3. PR 작성:

```markdown
## 📋 관련 이슈
- closes #12

## 📝 작업 내용
- User 도메인 모델 생성 (순수 POJO)
- UserRepositoryPort + PersistenceAdapter 구현
- 회원가입/로그인 API 구현
- 로그인/가입 페이지 UI 구현

## ✅ 체크리스트
- [ ] 헥사고날 구조 준수 (Service → Port만 의존)
- [ ] Domain 모델에 JPA 어노테이션 없음
- [ ] 컴파일/빌드 정상
- [ ] API 테스트 완료 (Swagger 또는 Postman)

## 📸 스크린샷 (UI 변경 시)
(해당 시 캡처 첨부)
```

> **💡 `closes #12`를 PR에 넣으면** PR이 머지될 때 이슈 #12가 **자동으로 닫힙니다!**

---

## 🔍 Step 4: 팀장 코드 리뷰

### 팀장이 확인할 것

1. **GitHub PR 페이지 → "Files changed" 탭** 클릭
2. 변경된 파일을 한눈에 확인
3. 문제 있는 줄에 **코멘트** 남기기 (줄 번호 옆 + 버튼)

### 리뷰 체크리스트

```
□ 헥사고날 아키텍처 준수
  □ Service에서 JPA Repository 직접 참조 없음
  □ Port(Out) 반환 타입이 도메인 모델
  □ Controller에 비즈니스 로직 없음

□ 파일 위치 적절 (담당 모듈 밖의 파일 수정 없음)

□ 코드 품질
  □ 파일이 300줄 미만
  □ 메서드가 50줄 미만
  □ Map<String, Object> 사용 없음

□ FE (해당 시)
  □ 컴포넌트 폴더 구조 준수
  □ page.tsx 150줄 미만
```

### 리뷰 후 액션

| 상태 | 액션 |
|------|------|
| ✅ 문제 없음 | **"Approve"** → 머지 |
| ⚠️ 수정 필요 | **"Request changes"** + 코멘트 → 팀원이 수정 후 재푸쉬 |
| ❓ 질문 | **"Comment"** → 논의 후 결정 |

---

## ✅ Step 5: 머지 (팀장)

1. PR 페이지에서 **"Squash and merge"** 버튼 클릭
   - Squash merge: 여러 커밋을 하나로 합쳐서 master에 깔끔하게 반영
2. 머지 커밋 메시지 확인 후 **"Confirm"**
3. 머지 완료 후 **"Delete branch"** 버튼으로 원격 브랜치 정리

> **💡 Squash and merge를 추천하는 이유:**  
> 팀원이 10번 커밋했어도 master에는 1개의 깔끔한 커밋으로 들어갑니다.

---

## 🔄 Step 6: 작업 후 정리 (팀원)

### 머지된 후 로컬 정리
```bash
# master로 돌아와서 최신 받기
git switch master
git pull origin master

# 머지 완료된 로컬 브랜치 삭제
git branch -d feature/12-user-api

# 다음 이슈 작업 시작
git switch -c feature/18-event-api
```

---

## ⚠️ 충돌 발생 시

### 내 브랜치가 master와 충돌할 때
```bash
# 1. 최신 master 받기
git switch master
git pull origin master

# 2. 내 브랜치로 돌아가서 master를 합치기
git switch feature/12-user-api
git merge master

# 3. 충돌 파일 확인 — VS Code/Cursor에서 직접 수정
#    <<<<<<< HEAD (내 코드)
#    =======
#    >>>>>>> master (master 코드)
#    → 둘 중 하나 선택하거나 합치기

# 4. 충돌 해결 후
git add .
git commit -m "merge: master 충돌 해결"
git push origin feature/12-user-api
```

> **역할분담 제안서의 수직 분할 원칙을 따르면** 충돌은 거의 없습니다.  
> 충돌이 잦다면 담당 범위가 겹치고 있다는 신호!

---

## 📊 전체 브랜치 구조

```
master (보호됨 — PR 통해서만 머지)
├── feature/6-spring-boot-init        ← A
├── feature/12-user-api               ← A
├── feature/18-event-api              ← B
├── feature/21-order-payment          ← C
├── feature/22-community-api          ← D
├── feature/7-nextjs-init             ← E
└── feature/22-post-comment-api       ← F (6인 시)
```

---

## 🛡️ GitHub 설정 (팀장이 1회 설정)

### Branch Protection Rule 설정 (중요!)

> GitHub 저장소 → **Settings** → **Branches** → **Add rule**

| 설정 | 값 | 이유 |
|------|---|------|
| Branch name pattern | `master` | master 브랜치에 규칙 적용 |
| ✅ Require a pull request before merging | 체크 | 직접 push 금지, PR만 허용 |
| ✅ Require approvals (1) | 체크 | 최소 1명(팀장) 승인 필요 |
| ✅ Dismiss stale pull request approvals | 체크 | 코드 수정되면 승인 초기화 |

> 이 설정을 하면 **팀원이 실수로 master에 직접 push 하는 것을 원천 차단**합니다.

---

## 📅 일일 작업 루틴

### 매일 아침 (작업 시작 시)
```bash
# 1. master 최신화
git switch master
git pull origin master

# 2. 내 브랜치로 전환
git switch feature/12-user-api

# 3. master 변경사항 내 브랜치에 반영
git merge master
```

### 매일 저녁 (작업 종료 시)
```bash
# 1. 작업 내용 커밋
git add .
git commit -m "feat: 오늘 작업 내용 (#12)"

# 2. 원격에 푸쉬 (백업 목적도 있음)
git push origin feature/12-user-api
```

---

## 🎯 핵심 규칙 요약

| # | 규칙 | 이유 |
|---|------|------|
| 1 | **master에 직접 push 금지** | PR → 리뷰 → 머지만 허용 |
| 2 | **브랜치명에 이슈번호 포함** | 추적성 확보 |
| 3 | **커밋에 #이슈번호 포함** | 이슈와 자동 연동 |
| 4 | **PR에 closes #이슈번호** | 머지 시 이슈 자동 닫힘 |
| 5 | **자기 모듈 파일만 수정** | 역할분담 제안서의 충돌 방지 규칙 |
| 6 | **매일 master pull 후 merge** | 충돌 조기 발견 |
