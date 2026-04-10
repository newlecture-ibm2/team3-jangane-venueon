# 🖼️ 프론트엔드 레이아웃 가이드

> **원칙:** Root Layout 1개. 콘텐츠 패턴은 globals.css 클래스 3개로 관리.

---

## 핵심 구조

```
┌──────────────────────────────────────────┐
│     Header (pathname으로 role 자동 감지)   │  ← Root Layout
├──────────────────────────────────────────┤
│                                          │
│              <main>                      │  ← 각 page.tsx가 클래스 선택
│              (Content Area)              │
│                                          │
├──────────────────────────────────────────┤
│     Footer (admin이면 숨김)               │  ← Root Layout
└──────────────────────────────────────────┘
```

- **Root Layout 1개** — Header + `<main>` + Footer + Toast
- **Header** — `usePathname()`으로 role 자동 감지 (기본/호스트/어드민)
- **Footer** — `/admin` 경로면 `return null` (숨김)
- **콘텐츠 패턴** — globals.css의 클래스 3개로 결정
- **Route Group 없음** — 폴더 = URL

---

## Root Layout

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "VenueOn — 이벤트 중계 플랫폼",
  description: "유료·무료 이벤트를 탐색하고, 티켓을 구매하고, 커뮤니티에 참여하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
```

### Header — pathname으로 role 자동 감지

```tsx
// components/layout/Header.tsx
'use client';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const role = pathname.startsWith('/admin') ? 'admin'
             : pathname.startsWith('/host') ? 'host'
             : 'user';

  // role에 따라 다른 헤더 렌더링
}
```

### Footer — admin이면 숨김

```tsx
// components/layout/Footer.tsx
'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  // 기존 Footer 렌더링
}
```

---

## 콘텐츠 패턴 — globals.css 클래스 3개

```css
/* styles/globals.css */

/* 1. 풀 와이드 — 목록 페이지 */
.container-full {
  width: 100%;
  padding: var(--space-24);
}

/* 2. 싱글 콘텐츠 — 상세/폼 페이지 */
.container-single {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-24);
}

/* 3. 사이드바 — 대시보드 페이지 */
.container-sidebar {
  display: flex;
  min-height: calc(100vh - 64px);
}
.sidebar {
  flex: 1;
  padding: var(--space-24);
  overflow-y: auto;
}

/* 반응형 */
@media (max-width: 768px) {
  .container-full {
    padding: var(--space-16);
  }
  .container-single {
    max-width: 100%;
    padding: var(--space-16);
  }
  .container-sidebar {
    flex-direction: column;
  }
  .sidebar {
    padding: var(--space-16);
  }
}
```

---

## 사용 예시

### 풀 와이드 — 강의 목록

```tsx
// app/events/page.tsx
export default function EventsPage() {
  return (
    <div className="container-full">
      <h1>이벤트 탐색</h1>
      {/* EventList, Filter 등 */}
    </div>
  );
}
```

### 싱글 콘텐츠 — 강의 상세

```tsx
// app/events/[id]/page.tsx
export default function EventDetailPage() {
  return (
    <div className="container-single">
      <h1>이벤트 상세</h1>
      {/* EventDetail, ReviewSection 등 */}
    </div>
  );
}
```

### 사이드바 — 어드민 강의 관리

```tsx
// app/admin/seminars/page.tsx
import Sidebar from '@/components/layout/Sidebar';

export default function AdminSeminarsPage() {
  return (
    <div className="container-sidebar">
      <Sidebar role="admin" />
      <div className="sidebar">
        <h1>강의 관리</h1>
        {/* AdminEventTable 등 */}
      </div>
    </div>
  );
}
```

### 사이드바 — 호스트 대시보드

```tsx
// app/host/dashboard/page.tsx
import Sidebar from '@/components/layout/Sidebar';

export default function HostDashboardPage() {
  return (
    <div className="container-sidebar">
      <Sidebar role="host" />
      <div className="sidebar">
        <h1>호스트 대시보드</h1>
      </div>
    </div>
  );
}
```

---

## Auth 페이지

기존 `(auth)` Route Group과 `auth.module.css`를 그대로 유지한다.

---

## 라우트 구조 요약

```
app/
├── layout.tsx                  # Root: Header(스마트) + main + Footer(스마트) + Toast
├── page.tsx                    # / 메인 홈 (container-full)
│
├── events/
│   ├── page.tsx                # /events 강의 목록 (container-full)
│   ├── new/page.tsx            # /events/new 강의 생성 (container-single)
│   └── [id]/page.tsx           # /events/:id 강의 상세 (container-single)
│
├── community/
│   ├── page.tsx                # /community 목록 (container-full)
│   └── [id]/page.tsx           # /community/:id 상세 (container-single)
│
├── (auth)/                     # 기존 유지
│   ├── auth.module.css
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── mypage/
│   ├── page.tsx                # /mypage (container-sidebar + role="user")
│   ├── orders/page.tsx
│   └── ...
│
├── host/
│   ├── page.tsx                # /host 랜딩 (container-full 또는 container-single)
│   ├── dashboard/page.tsx      # /host/dashboard (container-sidebar + role="host")
│   └── ...
│
├── admin/
│   ├── page.tsx                # /admin (container-sidebar + role="admin")
│   ├── users/page.tsx
│   ├── seminars/page.tsx
│   └── ...
│
└── api/                        # BFF
```

---

## 규칙 정리

| # | 규칙 |
|---|------|
| 1 | **Root Layout 1개** — Header(스마트) + Footer(스마트) + Toast |
| 2 | **Header는 pathname으로 role 자동 감지** — 기본/호스트/어드민 |
| 3 | **Footer는 admin에서 숨김** — `pathname.startsWith('/admin')` → `return null` |
| 4 | **콘텐츠 패턴은 클래스 3개** — `container-full`, `container-single`, `container-sidebar` |
| 5 | **사이드바가 필요하면 page.tsx에서 Sidebar 직접 import** — 래퍼 컴포넌트, Route Group 없음 |
| 6 | **Auth는 기존 방식 유지** — `auth.module.css`로 처리 |
