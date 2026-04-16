# Host 프론트엔드 비표준 패턴 감사 결과

## 조사 범위
`host/` 디렉토리 전체를 `mypage/`, `orders/`, `events/` 등 다른 도메인의 구현 패턴과 비교

---

## 🔍 발견된 비표준 패턴 (6가지 유형)

### 1. 페이지네이션: 공통 컴포넌트 미사용 (자체 구현)

다른 도메인(`mypage/orders`, `mypage/events`, `mypage/contact` 등)은 모두 공통 `<Pagination>` 컴포넌트를 사용하는데, host 쪽은 **직접 `<button>` + CSS로 페이지네이션을 구현**하고 있습니다.

| 파일 | 방식 | 표준 |
|---|---|---|
| `host/events/page.tsx` (L122-145) | 직접 `<button>` 구현 | ❌ |
| `host/payments/page.tsx` (L221-242) | 직접 `<button>` 구현 | ❌ |
| `mypage/orders/page.tsx` | `<Pagination>` 공통 컴포넌트 | ✅ |
| `mypage/events/page.tsx` | `<Pagination>` 공통 컴포넌트 | ✅ |
| `host/contact/page.tsx` | `<Pagination>` 공통 컴포넌트 | ✅ (유일하게 표준) |

> **권장**: `host/events/page.tsx`, `host/payments/page.tsx` → `<Pagination>` 공통 컴포넌트로 교체

---

### 2. 레이아웃 래퍼 불일치

`mypage/`는 모든 페이지에서 동일한 패턴을 사용:
```tsx
// ✅ mypage 표준 패턴
<div className="container-sidebar">
  <Sidebar role="user" />
  <div className="sidebar-content">
    ...
  </div>
</div>
```

반면 `host/`는 페이지마다 래퍼 구조가 **제각각**:

| 파일 | Sidebar 래퍼 | 메인 콘텐츠 |
|---|---|---|
| `host/page.tsx` | `<div className={styles.sidebarWrapper}>` + 모바일 토글 | `<div className="sidebar">` |
| `host/attendees/page.tsx` | `<div className={styles.sidebarWrapper}>` | `<div className="sidebar">` |
| `host/payments/page.tsx` | `<div className="sidebar">` | `<div className="sidebar-content">` |
| `host/payments/[id]/page.tsx` | `<div className="sidebar">` | `<div className="sidebar-content">` |
| `host/events/page.tsx` | 직접 `<Sidebar>` | `<main className="sidebar">` |
| `host/events/[id]/page.tsx` | 직접 `<Sidebar>` | `<main className="sidebar-content">` |
| `host/profile/page.tsx` | `<div className="sidebar">` | `<div className="sidebar-content">` |

> **권장**: `mypage/` 스타일처럼 `<Sidebar> + <div className="sidebar-content">` 패턴으로 통일

---

### 3. 테이블: 공통 `<Table>` 컴포넌트 미사용 (직접 `<table>` 구현)

| 파일 | 방식 | 표준 |
|---|---|---|
| `host/page.tsx` (대시보드 주문 테이블) | 직접 `<table>` | ❌ |
| `host/payments/page.tsx` | 직접 `<table>` | ❌ |
| `host/attendees/page.tsx` | 직접 `<table>` | ❌ |
| `host/contact/page.tsx` | `<Table>` 공통 컴포넌트 | ✅ |
| `mypage/orders/page.tsx` | `<Table>` 공통 컴포넌트 | ✅ |

> **권장**: `host/payments`, `host/attendees`, `host/page.tsx` → `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>` 공통 컴포넌트로 교체

---

### 4. CSS 모듈 경계 위반: 부모 페이지 CSS를 자식이 import

```tsx
// ❌ host/attendees/page.tsx
import styles from '../page.module.css';  // 부모(host/page.tsx)의 CSS를 가져다 씀
```

다른 도메인에서는 각 페이지가 **자체 `page.module.css`**를 가지고 있습니다.

> **권장**: `host/attendees/page.module.css`를 별도로 생성하거나, 공통 스타일이 필요하면 공유 CSS 파일로 분리

---

### 5. 영어 상태코드 → 한글 매핑 (기존 문서에 정리됨)

`FE_이벤트_호스트_프런트_맵핑_해결.md`에 이미 정리된 내용입니다. 추가로 발견:

| 파일 | 문제 |
|---|---|
| `host/attendees/page.tsx` (L140-143) | `item.status === 'PAID'` 영어 비교 + 인라인 스타일로 한글 매핑 |

---

### 6. API 호출 방식 혼재 (`api.get` vs raw `fetch`)

프로젝트에는 인증 처리가 포함된 `api` 래퍼(`@/lib/api`)가 있는데, host 내에서 두 방식이 혼재:

| 방식 | 사용 파일 |
|---|---|
| `api.get()` ✅ | `host/page.tsx`, `host/payments/page.tsx`, `host/attendees/page.tsx`, `host/payments/[id]/page.tsx` |
| raw `fetch()` ❌ | `StatusPanel.tsx`, `EventForm.tsx`, `host/events/[id]/edit/page.tsx` |

> **참고**: `EventForm.tsx`의 경우 `/api/` 프리픽스를 사용하는 Next.js API 라우트를 호출하므로 raw fetch가 의도적일 수 있음. 하지만 `StatusPanel.tsx`에서 `/api/host/events/...`를 raw fetch로 호출하는 것은 `api` 래퍼와 불일치

---

## 요약 테이블

| # | 유형 | 심각도 | 영향 파일 수 |
|---|---|---|---|
| 1 | 페이지네이션 직접 구현 | 🟡 중 | 2 |
| 2 | 레이아웃 래퍼 제각각 | 🟡 중 | 5+ |
| 3 | 테이블 직접 구현 | 🟡 중 | 3 |
| 4 | 부모 CSS import | 🔴 높 | 1 |
| 5 | 영어 상태 매핑 (기존) | 🔴 높 | 별도 문서 |
| 6 | fetch vs api 혼재 | 🟢 낮 | 2-3 |
