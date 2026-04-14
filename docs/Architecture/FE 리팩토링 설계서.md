# 🔍 프론트엔드 리팩토링 분석 — PROJECT_ARCHITECTURE_REFERENCE 기준

> **분석 기준:** [PROJECT_ARCHITECTURE_REFERENCE.md](file:///home/young/workspace/team3-jangane-venueon/docs/Reference/PROJECT_ARCHITECTURE_REFERENCE.md) §4~6 프론트엔드 체크리스트

---

## 🚨 등급별 위반 요약

| 등급 | 위반 수 | 설명 |
|------|---------|------|
| 🔴 즉시 수정 | 3건 | 500줄+ 파일, 아키텍처 위반 수준 |
| 🟠 분리 필요 | 6건 | 300~500줄 파일, _components 미생성 |
| 🟡 개선 권장 | 3건 | 컴포넌트 폴더 구조, API 파일 분리 |

---

## 🔴 즉시 수정 — 500줄 이상 (아키텍처 위반)

### 1. EventForm.tsx — **1,152줄** ← 가장 심각

> **위치:** [EventForm.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/events/new/_components/EventForm.tsx)
> **위반:** 실수 #2 (단일 컴포넌트에 UI + 로직 혼재)

**현재:** 이벤트 생성 폼의 모든 로직(스텝 관리, 세션 CRUD, 티켓 CRUD, 유효성 검증, 제출)이 단일 파일

**권장 분리:**
```
EventForm/
├── EventForm.tsx           # 메인 컨테이너 (스텝 전환만)
├── useEventForm.ts         # 커스텀 훅 (상태 관리 + 제출 로직)
├── _components/
│   ├── BasicInfoStep/      # Step 1: 기본 정보
│   ├── SessionStep/        # Step 2: 세션 관리
│   ├── TicketStep/         # Step 3: 티켓 설정
│   └── PreviewStep/        # Step 4: 미리보기/제출
└── EventForm.module.css
```

### 2. CommunityPostContainer.tsx — **610줄**

> **위치:** [CommunityPostContainer.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/community/components/CommunityPostContainer.tsx)
> **위반:** 실수 #2 + 실수 #3 (폴더 없이 단독 파일)

**현재:** 게시글 목록 + 상세 + 댓글 + 좋아요 + 고정 로직이 하나의 컴포넌트에

**추가 문제:** `community/components/` 폴더에 컴포넌트가 개별 폴더 없이 단독 파일로 존재

### 3. ui-test/page.tsx — **748줄**

> **위치:** [ui-test/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/ui-test/page.tsx)
> **참고:** 테스트 페이지이므로 프로덕션 우선순위는 낮음. 하지만 정리 or 삭제 검토 필요

---

## 🟠 분리 필요 — 300~500줄 또는 _components 미생성

### 4. mypage/profile/page.tsx — **360줄**, `_components` ❌

> **위반:** 실수 #1 (page.tsx에 모든 것을 다 넣기)
> 프로필 수정 UI + 로직이 page.tsx에 직접 구현

### 5. admin/settings/page.tsx — **322줄**, `_components` ✅ (있으나 page 내 로직 과다)

### 6. admin/reports/ReportTable.tsx — **347줄**

> 300줄 초과 → 서브 컴포넌트 분리 검토

### 7. 150줄 이상 page.tsx 중 `_components` 미생성 (14건)

| 줄 수 | 페이지 | `_components` |
|-------|--------|:---:|
| 271 | orders/checkout/page.tsx | ❌ |
| 256 | host/payments/[id]/page.tsx | ❌ |
| 250 | orders/refund/page.tsx | ❌ |
| 249 | host/payments/page.tsx | ❌ |
| 227 | page.tsx (메인 홈) | ❌ |
| 219 | host/page.tsx (대시보드) | ❌ |
| 215 | mypage/contact/page.tsx | ❌ |
| 200 | mypage/events/page.tsx | ❌ |
| 197 | mypage/orders/[id]/page.tsx | ❌ |
| 193 | cart/page.tsx | ❌ |
| 185 | orders/checkout/success/page.tsx | ❌ |
| 175 | host/events/page.tsx | ❌ |
| 171 | host/attendees/page.tsx | ❌ |
| 166 | host/contact/page.tsx | ❌ |

> 레퍼런스 기준: "page.tsx 생성 시 **동시에 `_components/` 폴더도 생성**", "150줄을 넘기면 즉시 분리"

---

## 🟡 개선 권장 — 구조/컨벤션 통일

### 8. 공유 컴포넌트 폴더 구조 위반 (실수 #3)

레퍼런스 기준: **"모든 컴포넌트는 폴더로 생성 — 예외 없음"**

현재 위반 영역:

| 디렉토리 | 파일 수 | 문제 |
|----------|---------|------|
| `components/ui/` | 45개 파일 | **폴더 없이 단독 파일**로 존재 (Button.tsx, Card.tsx 등) |
| `components/modal/` | 21개 파일 | **폴더 없이 단독 파일**로 존재 |
| `components/layout/` | 7개 파일 | **폴더 없이 단독 파일** (Header.tsx, Sidebar.tsx 등) |
| `components/icons/` | 42개 파일 | 아이콘은 단독 파일이 합리적이나, 정리 검토 |
| `community/components/` | 11개 파일 | **폴더 없이 단독 파일**, `_components`가 아닌 `components` 이름 사용 |

**올바른 패턴 (레퍼런스 §5 실수 #3):**
```
components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.module.css
│   └── index.ts
└── index.ts
```

### 9. API 함수 파일 분리 미흡 (실수 #5)

**현재 구조:**
```
lib/
├── api.ts          # ← 여러 도메인 API가 혼재될 가능성
├── auth-api.ts     # ✅ 인증 API 분리
├── admin-api.ts    # ✅ 관리자 API 분리
├── contact-api.ts  # ✅ 문의 API 분리
├── session.ts
└── utils.ts
```

**누락된 도메인별 API 파일:**
- `eventAPI.ts` — 이벤트 조회/생성/수정/삭제
- `hostAPI.ts` — 호스트 센터 전용 API
- `communityAPI.ts` — 커뮤니티 API
- `orderAPI.ts` — 주문/결제 API
- `reviewAPI.ts` — 리뷰 API
- `wishlistAPI.ts` — 찜 API
- `cartAPI.ts` — 장바구니 API

> 이 API 함수들이 각 page.tsx 내에 inline으로 작성되어 있을 가능성이 높음

### 10. BFF 라우트 핸들러 분리 (실수 #6)

**현재:** `app/api/[...path]/route.ts` — 단일 파일

**레퍼런스 권장:**
```
app/api/[...path]/
├── route.ts              # 라우터 (분기만)
└── handlers/
    ├── authHandlers.ts
    └── proxyHandler.ts
```

---

## 📊 우선순위별 리팩토링 제안

| Phase | 대상 | 예상 난이도 |
|-------|------|------------|
| **Phase 1** | EventForm.tsx 1,152줄 분리 | 🔴 높음 (핵심 기능) |
| **Phase 1** | CommunityPostContainer.tsx 610줄 분리 | 🔴 높음 |
| **Phase 2** | 300줄+ page.tsx 분리 (profile, settings) | 🟠 중간 |
| **Phase 2** | 150줄+ page.tsx에 `_components/` 폴더 생성 + 로직 분리 | 🟠 중간 |
| **Phase 3** | components/ 폴더 구조 정리 (ui/, modal/, layout/) | 🟡 낮음 (대량 파일 이동) |
| **Phase 4** | API 함수 도메인별 분리 + BFF 핸들러 분리 | 🟡 낮음 |

> [!WARNING]
> **Phase 3 (컴포넌트 폴더 구조 정리)**는 `import` 경로가 일괄 변경되므로, 다른 작업과 분리하여 한 번에 진행하는 것을 권장합니다. 현재 `index.ts` barrel export를 사용 중이라면 영향이 최소화됩니다.



# 리팩토링 설계서 기준 — API_스펙_v7 / 아키텍처_v7 불일치 수정 계획

## 발견된 불일치 사항

리팩토링 설계서를 기준(ground truth)으로, API_스펙_v7.md와 아키텍처_v7.md에서 발견된 불일치 사항을 정리합니다.

---

### 불일치 1: 이벤트 CRUD API 경로 — `/events` vs `/host/events`

> [!IMPORTANT]
> **가장 큰 불일치입니다.** 리팩토링 설계서에서는 이벤트 CUD(Create/Update/Delete) 기능이 `host/event/` 패키지로 이동하며 **호스트 전용 기능**으로 분류됩니다. 그런데 API_스펙_v7에서는 이벤트 CRUD 경로가 `/events`로 되어 있습니다.

| 문서 | 현재 경로 | 설계서 기준 |
|------|-----------|------------|
| **API_스펙_v7** §2-3 (#33~37) | `POST /events`, `PUT /events/{id}`, `DELETE /events/{id}`, `PATCH /events/{id}/status`, `POST /events/{id}/thumbnail` | `POST /host/events`, `PUT /host/events/{id}` 등 `/host/` 접두사 필요 |
| **API_스펙_v7** §2-4 (#39~42) | `POST /events/{eventId}/sessions`, `PUT /events/{eventId}/sessions/{sessionId}` 등 | `POST /host/events/{eventId}/sessions` 등 `/host/` 접두사 필요 |

**수정 방안:** 호스트 전용 CUD API는 모두 `/host/events/...` 경로로 변경

---

### 불일치 2: 아키텍처의 Session이 event 모듈 내에 포함

| 문서 | 현재 | 설계서 기준 |
|------|------|------------|
| **아키텍처_v7** §7 event 모듈 | `Session.java`가 `event/domain/model/` 내부, `SessionController`가 `event/adapter/in/web/` 내부, `SessionJpaEntity` 등도 `event/adapter/out/persistence/` | `session/` 독립 도메인으로 분리 |

**설계서 기준:**
- `session/adapter/in/web/SessionController.java` — `GET /events/{id}/sessions`
- `session/domain/model/Session.java`
- `session/application/port/in/GetSessionUseCase.java`

**수정 방안:** 아키텍처_v7의 event 모듈 내부 구조에서 Session 관련 파일을 분리하여, 독립 `session/` 모듈로 재구성

---

### 불일치 3: 아키텍처 모듈 목록에 Manager Actor 미반영

| 문서 | 현재 | 설계서 기준 |
|------|------|------------|
| **아키텍처_v7** §4 모듈 목록 | `admin`, `host` Actor만 존재 | `manager/` Actor 추가 (커뮤니티 관리자) |

**설계서 기준 Manager 패키지:**
- `com.venueon.manager.post` — 커뮤니티 내 게시글 관리 (pin, hide, delete)
- `com.venueon.manager.comment` — 커뮤니티 내 댓글 관리
- `com.venueon.manager.community` — 커뮤니티 설정 관리
- `com.venueon.manager.member` — 멤버 강퇴/역할 변경

**수정 방안:** 아키텍처_v7 모듈 목록에 `manager.*` 패키지 추가

---

### 불일치 4: Admin 모듈에 post/comment/event 하위 도메인 미반영

| 문서 | 현재 | 설계서 기준 |
|------|------|------------|
| **아키텍처_v7** §4 모듈 목록 | `com.venueon.admin.*` — "관리자 회원 정지/권한, 공지 CUD, 카테고리 CUD"만 언급 | `admin/post/`, `admin/comment/`, `admin/event/` 추가 |

**설계서 기준 Admin 하위 도메인:**
- `admin/post/` — AdminPostController (`/admin/posts/**`), PostAdminUseCase
- `admin/comment/` — AdminCommentController (`/admin/comments/**`), CommentAdminUseCase
- `admin/event/` — AdminEventController (`/admin/events/**`), GetAllEventsAdminUseCase, ForceEventStatusUseCase, DeleteEventAdminUseCase

**수정 방안:** 아키텍처_v7 모듈별 역할 테이블에 admin 서브도메인 상세 추가

---

### 불일치 5: 아키텍처의 event 모듈 UseCase 이름 불일치

| 문서 | 현재 | 설계서 기준 |
|------|------|------------|
| **아키텍처_v7** §7 event 모듈 | `GetEventUseCase`, `GetSessionUseCase` | `GetEventListUseCase`, `GetEventDetailUseCase` (event), `GetSessionUseCase` (session 독립 모듈) |

**수정 방안:** event 모듈의 UseCase 이름을 설계서와 일치시킴

---

### 불일치 6: contact 도메인 구조 미반영

| 문서 | 현재 | 설계서 기준 |
|------|------|------------|
| **아키텍처_v7** | contact 도메인이 모듈 목록/구조에 없음 | Core 도메인에 `contact/` 독립 모듈 존재 (사용자 문의 생성) |

**설계서 기준:**
- `contact/adapter/in/web/UserContactController.java` — `POST /contacts`
- `contact/domain/model/Contact.java`, `ContactCategory.java`, `ContactStatus.java`
- Admin에서는 `admin/contact/` 로 관리

**수정 방안:** 아키텍처_v7 모듈 목록에 contact 모듈 추가 (현재 admin.contact만 있고 core contact가 없음)

---

### 불일치 7: API 스펙의 이벤트 세션 CUD 섹션 분류

| 문서 | 현재 | 설계서 기준 |
|------|------|------------|
| **API_스펙_v7** §2-4 | "이벤트 세션 API"로 일반 R과 Host CUD가 한 섹션에 혼재 | Host 세션 CUD는 별도 "호스트 세션 관리 API" 섹션으로 분리, 경로에 `/host/` 접두사 |

---

## Proposed Changes

### [MODIFY] [API_스펙_v7.md](file:///home/young/workspace/team3-jangane-venueon/docs/Architecture/API_스펙_v7.md)

1. **§2-3 이벤트 CRUD API 경로 수정**: `/events` → `/host/events`로 변경 (HOST 전용)
2. **§2-4 세션 API 분리**: 일반 R(`GET /events/{id}/sessions`)은 유지, Host CUD는 `/host/events/{eventId}/sessions/...`로 변경하고 별도 섹션으로 분리
3. **§2-7 호스트 이벤트 관리 API와 통합**: §2-3의 CUD가 `/host/events/...`로 이동하므로 §2-7과 자연스럽게 통합

### [MODIFY] [아키텍처_v7.md](file:///home/young/workspace/team3-jangane-venueon/docs/Architecture/아키텍처_v7.md)

1. **§4 모듈 목록에 `manager.*` 패키지 추가**: manager.post, manager.comment, manager.community, manager.member
2. **§4 모듈 목록에 `admin.*` 하위 상세 추가**: admin.post, admin.comment, admin.event
3. **§7 event 모듈 구조에서 Session 분리**: Session을 독립 `session/` 모듈로 이동
4. **§7 event 모듈 UseCase 이름 수정**: `GetEventUseCase` → `GetEventListUseCase` + `GetEventDetailUseCase`
5. **§4 모듈 목록에 contact 모듈 추가**

---

## Verification Plan

### Manual Verification
- 수정 후 세 문서 간 패키지 경로, API 경로, UseCase 이름이 모두 일치하는지 교차 확인
- 리팩토링 설계서의 TO-BE 디렉토리 트리와 아키텍처 문서의 모듈 구조가 1:1 대응하는지 확인


