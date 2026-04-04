# 🧭 프론트엔드 레이아웃 의사결정 기록

> 왜 이 구조를 선택했는가 — 검토한 6가지 방식과 거절 사유, 최종 구조의 장점

---

## 최종 결정

- **Root Layout 1개** — Smart Header/Footer
- **콘텐츠 패턴은 globals.css 클래스 3개** — `container-full`, `container-single`, `container-sidebar`
- **Route Group / 래퍼 컴포넌트 없음**
- **사이드바는 page.tsx에서 Sidebar 직접 import**

### 최종 구조

```
app/
├── layout.tsx                  # Root Layout (Header + main + Footer + Toast)
├── page.tsx                    # / (container-full)
│
├── events/
│   ├── page.tsx                # /events (container-full)
│   ├── new/page.tsx            # /events/new (container-single)
│   └── [id]/page.tsx           # /events/[id] (container-single)
│
├── community/
│   ├── page.tsx                # /community (container-full)
│   └── [id]/page.tsx           # /community/[id] (container-single)
│
├── mypage/
│   ├── page.tsx                # /mypage (container-sidebar + Sidebar import)
│   └── orders/page.tsx         # /mypage/orders (container-sidebar + Sidebar import)
│
├── host/
│   ├── page.tsx                # /host 랜딩 (container-full, Sidebar 없음)
│   └── dashboard/page.tsx      # /host/dashboard (container-sidebar + Sidebar import)
│
├── admin/
│   ├── page.tsx                # /admin (container-sidebar + Sidebar import)
│   └── users/page.tsx          # /admin/users (container-sidebar + Sidebar import)
│
├── (auth)/                     # 기존 유지
│   ├── login/page.tsx
│   └── signup/page.tsx
│
└── api/                        # BFF

components/
├── layout/                     # Header, Footer, Sidebar (Smart Component)
├── ui/                         # Button, Card, Toast 등 공유 UI
├── icons/                      # 아이콘
└── modal/                      # ConfirmModal, ModalOverlay 등 공유 모달
```

### 핵심 코드

```tsx
// page.tsx에서 클래스 하나로 콘텐츠 패턴 결정
<div className="container-full">...</div>      // 풀 와이드
<div className="container-single">...</div>    // 싱글 콘텐츠
<div className="container-sidebar">            // 사이드바
  <Sidebar role="admin" />
  <div className="sidebar">...</div>
</div>
```

---

## 검토했던 방식과 거절 사유

### 1. 레이아웃 컴포넌트 3개

각 콘텐츠 패턴마다 래퍼 컴포넌트를 만들고 Route Group의 layout.tsx에서 감싸는 방식.

```
components/layout/
├── FullWidthLayout.tsx          # width: 100%
├── SingleContentLayout.tsx      # max-width: 800px; margin: 0 auto
├── SidebarLayout.tsx            # display: flex + Sidebar
└── ...

app/
├── (main)/                      # FullWidthLayout 적용
│   ├── layout.tsx
│   └── events/page.tsx
├── (content)/                   # SingleContentLayout 적용
│   ├── layout.tsx
│   └── events/[id]/page.tsx
├── (dashboard)/                 # SidebarLayout 적용
│   ├── layout.tsx
│   ├── mypage/
│   ├── host/
│   └── admin/
```

**거절 사유:**
- `SingleContentLayout`과 `FullWidthLayout`의 실체가 CSS 1~2줄에 불과 (`max-width`, `padding`)
- CSS 한 줄짜리를 위해 컴포넌트 파일 + Route Group + layout.tsx를 만드는 건 과함
- 레이아웃은 1개이고, 나머지는 콘텐츠 폭의 차이일 뿐

### 2. Route Group으로 레이아웃 분리 — `(main)` / `(content)` / `(dashboard)`

위 구조에서 발생하는 URL 분리 문제.

```
# /events 는 (main)에, /events/[id]는 (content)에 → 같은 경로가 두 곳에 분산
app/
├── (main)/events/page.tsx          # /events → 풀 와이드
├── (content)/events/[id]/page.tsx  # /events/[id] → 싱글 콘텐츠
```

**거절 사유:**
- `/events`를 찾으려면 `(main)`에 있는지 `(content)`에 있는지 알아야 함
- **폴더 = URL**의 직관성 깨짐
- 프로젝트 구조를 모르는 팀원이 파일을 찾기 어려움

### 3. `(dashboard)` Route Group에 사이드바 페이지 전부 묶기

```
app/
├── page.tsx
├── events/
├── (dashboard)/                 # 이름이 대시보드 페이지와 혼동
│   ├── layout.tsx               # Sidebar 자동 적용
│   ├── mypage/                  # /mypage → (dashboard) 안에 있음
│   ├── host/                    # /host → (dashboard) 안에 있음
│   └── admin/                   # /admin → (dashboard) 안에 있음
```

**거절 사유:**
- 프로젝트에 실제 "대시보드" 페이지(`/host/dashboard`)가 있어서 이름 혼동
- `/mypage`를 찾으려면 `(dashboard)/mypage/`를 알아야 함 → 직관성 저하
- `(sidebar)`로 이름 변경해도 폴더 = URL 원칙이 깨지는 건 동일

### 4. 각 섹션별 `(sidebar)` Route Group

```
app/
├── mypage/
│   ├── page.tsx                 # 사이드바 없는 페이지
│   └── (sidebar)/               # 사이드바 있는 페이지만 여기에
│       ├── layout.tsx
│       ├── orders/page.tsx
│       └── events/page.tsx
├── host/
│   ├── page.tsx
│   └── (sidebar)/
│       ├── layout.tsx
│       └── dashboard/page.tsx
├── admin/
│   └── (sidebar)/
│       ├── layout.tsx
│       └── users/page.tsx
```

**거절 사유:**
- 사이드바를 쓸지 말지는 page.tsx에서 import 한 줄이면 되는데, 폴더를 한 겹 더 추가하는 건 과함
- 불필요한 폴더 깊이 증가 (`admin/(sidebar)/users/page.tsx` vs `admin/users/page.tsx`)
- 팀원이 `/admin/users` 파일을 찾을 때 `(sidebar)` 안에 있다는 걸 알아야 함

### 5. SidebarLayout 래퍼 컴포넌트

```
components/layout/
├── SidebarLayout.tsx            # Sidebar + flex 래퍼
├── SidebarLayout.module.css
└── ...

# 사용:
app/mypage/(sidebar)/layout.tsx
→ import SidebarLayout from '@/components/layout/SidebarLayout'
→ <SidebarLayout role="user">{children}</SidebarLayout>
```

**거절 사유:**
- 래퍼가 하는 일이 `<div className="container-sidebar">` + `<Sidebar />` 뿐
- globals.css 클래스로 동일하게 처리 가능 → 별도 컴포넌트 불필요
- 파일 수만 늘어나고 실질적 이점 없음

### 6. 영역별 Header 분리 — `(user)/layout` / `host/layout` / `admin/layout`

수강생·호스트·어드민 영역마다 다른 layout.tsx에 다른 Header를 넣는 방식.

```
app/
├── layout.tsx                   # Root: 빈 껍데기 (Header 없음)
├── (user)/                      # 수강생 헤더
│   ├── layout.tsx               # UserHeader + Footer
│   ├── page.tsx                 # / → (user) 안으로 이동
│   ├── events/                  # /events → (user) 안으로 이동
│   └── mypage/
├── host/
│   ├── layout.tsx               # HostHeader
│   └── ...
├── admin/
│   ├── layout.tsx               # AdminHeader
│   └── ...
```

**거절 사유:**
- Next.js layout은 중첩 구조라 부모 layout의 Header를 자식이 교체할 수 없음
- `(user)` Route Group을 만들면 모든 일반 페이지가 폴더 한 겹 안으로 들어감
- "user"라는 이름도 부적절 — 해당 페이지들은 사용자만 접근하는 게 아니라 모두가 접근하는 페이지
- Smart Component(pathname 감지) 방식이 파일 수 0개 추가로 동일한 기능 제공

---

## 현재 방식의 장점

### 1. 단순함
- 추가 layout.tsx 없음 (Root 1개)
- 추가 래퍼 컴포넌트 없음
- Route Group 없음 (auth 기존 유지 제외)
- 파일 구조가 최소한

### 2. 직관성
- **폴더 = URL** — `/events`를 찾으려면 `app/events/` 열면 됨
- 각 page.tsx를 열면 어떤 컨테이너를 쓰는지 바로 보임 (`container-full` or `container-single`)
- 사이드바 사용 여부도 page.tsx의 import문에서 바로 확인 가능

### 3. 유지보수
- 콘텐츠 폭 변경 → globals.css **한 곳만** 수정
- 반응형 추가 → globals.css의 `@media` **한 곳만** 수정
- 사이드바 레이아웃 변경 → `.container-sidebar` **한 곳만** 수정
- 헤더/푸터 분기 변경 → 각 컴포넌트 내부 **한 곳만** 수정

### 4. 유연함
- 같은 URL 경로 내에서도 페이지마다 다른 패턴 적용 가능 (`/events` = full, `/events/[id]` = single)
- 사이드바를 쓸지 말지 page.tsx 단위로 자유롭게 결정 가능
- 나중에 규모가 커지면 Route Group이나 서브도메인으로 확장 가능

---

## 이 프로젝트에 적합한 이유

| 프로젝트 특성 | 이 구조가 적합한 이유 |
|--------------|---------------------|
| **MVP 단계** | 과도한 추상화보다 빠른 개발이 중요 |
| **3~4명 소규모 팀** | 복잡한 폴더 구조보다 "열면 바로 이해되는" 구조가 팀 생산성에 유리 |
| **헤더 3종류, 푸터 조건부** | Smart Component(pathname 감지)가 가장 적은 파일 수로 해결 |
| **페이지마다 콘텐츠 폭이 다름** | CSS 클래스 방식이 Route Group보다 유연 |
| **사이드바 유무가 페이지별로 다름** | page.tsx에서 직접 import가 Route Group보다 자유로움 |

---

## 현재 방식의 단점

| 단점 | 감수하는 이유 |
|------|-------------|
| **사이드바 코드 반복** — Sidebar를 쓰는 page.tsx마다 `container-sidebar` + `<Sidebar />` 구조가 반복됨 | 반복되는 양이 3~4줄 수준이고, Route Group이나 래퍼 컴포넌트를 추가하는 비용보다 작음 |
| **클래스 누락 가능** — 개발자가 `container-full`을 깜빡하고 안 붙일 수 있음 | layout.tsx 자동 적용과 달리 수동이지만, 코드 리뷰에서 잡을 수 있는 수준 |
| **Header/Footer가 Client Component** — `usePathname()` 사용으로 서버 컴포넌트가 될 수 없음 | Header/Footer는 어차피 로그인 버튼 등 인터랙션이 있어서 Client Component가 불가피 |
| **pathname 분기 로직** — 새로운 섹션(예: `/partner`)이 추가되면 Header에 분기 조건을 추가해야 함 | 섹션이 자주 추가되는 프로젝트가 아니고, 조건 추가는 한 줄임 |
| **글로벌 CSS 클래스** — CSS Module이 아니라 이름 충돌 가능성이 있음 | `container-full`, `container-sidebar` 같은 이름은 충분히 고유하고, 프로젝트 내 컨벤션으로 관리 |

---

## 부록: 서버 컴포넌트 vs 클라이언트 컴포넌트

| | 서버 컴포넌트 (기본) | 클라이언트 컴포넌트 (`'use client'`) |
|---|---|---|
| **실행 위치** | 서버에서만 렌더링 | 서버 + 브라우저 둘 다 |
| **JS 번들** | 브라우저에 JS 안 보냄 → 가벼움 | 브라우저에 JS 보냄 |
| **할 수 있는 것** | DB 조회, fetch, 비밀키 접근 | useState, useEffect, onClick, usePathname |
| **할 수 없는 것** | useState, onClick 등 인터랙션 | DB 직접 접근 |

한 줄 요약: **인터랙션이 필요하면 Client, 정적이면 Server.**

### Header/Footer가 Client Component여서 문제가 되나?

**문제 없다.**

- Header에는 로그인 버튼, 드롭다운, 네비게이션 등 인터랙션이 있음 → 어떤 방식이든 Client Component가 됨
- Footer는 원래 Server Component도 가능하지만, `usePathname()` 한 줄 때문에 Client가 됨 → 추가되는 JS가 매우 적음
- Next.js에서 대부분의 실제 서비스도 Header/Footer는 Client Component임
- VenueOn 규모에서는 서버/클라이언트 차이로 인한 성능 체감 차이 없음

---

## 참고

- [FRONTEND_LAYOUT_GUIDE.md](./FRONTEND_LAYOUT_GUIDE.md) — 최종 레이아웃 구현 가이드
- [PROJECT_ARCHITECTURE_REFERENCE.md](./PROJECT_ARCHITECTURE_REFERENCE.md) — 프로젝트 아키텍처 원칙
