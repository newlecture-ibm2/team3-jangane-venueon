# Events / Host 폴더 리팩토링 아키텍처 제안 (v5 — 최종)

## 배경
- `events/` → 일반 사용자의 **공개 조회(Read)** 전용 영역
- `host/events/` → 호스트 전용 **이벤트 CUD** 영역
- HOST 전용 기능(Create, Edit, StatusPanel)이 `events/`에 혼재 → 도메인 분리 필요
- 컴포넌트명에 불필요한 접두사가 반복 → 간소화 필요
- 인라인 스타일 사용 → CSS 모듈로 전환 필요 (Rule 2)

---

## 제안 구조 (After)

### 📂 components/ui/ — 공통 UI 컴포넌트

```
components/ui/
├── ...기존 컴포넌트들...
└── BackButton/                          # 🆕 events에서 승격 (범용 router.back())
    ├── BackButton.tsx
    └── BackButton.module.css
```

### 📂 events/ — 공개(Read Only) 영역

```
events/
├── page.tsx                         # 이벤트 목록
├── page.module.css
├── useEvents.ts                     # 🆕 Hook (fetchEvents, search, pagination)
└── [id]/
    ├── page.tsx                     # 이벤트 상세
    ├── page.module.css
    └── _components/
        ├── ReviewSection/                  # 🆕 Rule 5 적용 + CSS/Hook 분리
        │   ├── ReviewSection.tsx           # (EventReviewSection → ReviewSection)
        │   ├── ReviewSection.module.css    # 🆕 인라인 스타일 → CSS 모듈
        │   └── useEventReviews.ts          # 🆕 Hook (fetchReviews)
        ├── TicketList/                     # 🆕 Rule 5 적용 + Hook 분리
        │   ├── TicketList.tsx
        │   ├── TicketList.module.css
        │   └── useTicketCart.ts            # 🆕 Hook (장바구니 추가/중복체크)
        ├── SessionList/                    # 🆕 세션 목록 컴포넌트 분리
        │   ├── SessionList.tsx
        │   └── SessionList.module.css
        └── ActionMenu/                     # 🆕 Rule 5 적용 (EventActionMenu → ActionMenu)
            ├── ActionMenu.tsx              # edit 경로를 /host/events/[id]/edit 로 변경
            └── ActionMenu.module.css
```

> **BackButton 제거됨** — `components/ui/BackButton`을 import하여 사용

### 📂 host/ — 호스트 전용 영역

```
host/
├── events/
│   ├── page.tsx                     # 호스트 이벤트 목록
│   ├── page.module.css
│   ├── useHostEvents.ts             # 🆕 Hook (fetchEvents, tab/pagination)
│   ├── new/                         # 🆕 events/new/ → 여기로 이동
│   │   ├── page.tsx                 # EventForm 래퍼 (create 모드)
│   │   └── page.module.css          # 🆕 인라인 스타일 → CSS 모듈
│   └── [id]/
│       ├── page.tsx                 # 호스트 이벤트 상세
│       ├── page.module.css
│       ├── useEventDetail.ts        # 🆕 Hook (fetchDetail, fetchAttendees) + 타입 선언 통합
│       ├── edit/                    # 🆕 events/[id]/edit/ → 여기로 이동
│       │   ├── page.tsx             # EventForm 래퍼 (edit 모드)
│       │   └── page.module.css      # 🆕 인라인 스타일 → CSS 모듈
│       └── _components/
│           ├── DetailHeader/            # (EventDetailHeader → DetailHeader)
│           │   ├── DetailHeader.tsx
│           │   └── DetailHeader.module.css
│           ├── TabSection/              # (EventTabSection → TabSection)
│           │   ├── TabSection.tsx
│           │   └── TabSection.module.css
│           ├── Thumbnail/               # (EventThumbnail → Thumbnail)
│           │   ├── Thumbnail.tsx
│           │   └── Thumbnail.module.css
│           ├── HostProfile/             # ⚠️ 원래 위치 유지 (1곳에서만 사용)
│           │   ├── HostProfile.tsx
│           │   └── HostProfile.module.css
│           ├── EventForm/               # 🆕 events/new/_components/ 에서 이동 (이름 유지)
│           │   ├── EventForm.tsx
│           │   └── EventForm.module.css
│           ├── StatusPanel/             # 🆕 HostManagementPanel → StatusPanel 리네이밍+이동
│           │   ├── StatusPanel.tsx
│           │   └── StatusPanel.module.css
│           └── index.ts
├── profile/                         # (기존 유지)
├── payments/                        # (기존 유지)
├── contact/                         # (기존 유지)
├── attendees/                       # (기존 유지)
└── ...
```

---

## 변경 세부 내역

### 1. 공통 UI 승격

| Before | After | 이유 |
|---|---|---|
| `events/[id]/_components/BackButton/` | `components/ui/BackButton/` | 이벤트 로직 없음. `router.back()` 범용 컴포넌트 |

### 2. 새 컴포넌트 추출

| 컴포넌트 | 추출 대상 | 이유 |
|---|---|---|
| `SessionList` | `events/[id]/page.tsx` 202~230라인 세션 map 렌더링 | 세션 수 증가 시 page 비대화 방지 |

### 3. 도메인 이동 (HOST 전용 → host/ 하위)

| 항목 | Before | After |
|---|---|---|
| 이벤트 생성 페이지 | `events/new/` | `host/events/new/` |
| 이벤트 수정 페이지 | `events/[id]/edit/` | `host/events/[id]/edit/` |
| EventForm | `events/new/_components/` | `host/events/[id]/_components/EventForm/` |
| HostManagementPanel | `events/[id]/_components/` | `host/events/[id]/_components/StatusPanel/` |

### 4. 컴포넌트 리네이밍 (중복 접두어 제거)

#### `host/events/[id]/_components/` 내
| Before | After | 이유 |
|---|---|---|
| `HostManagementPanel` | `StatusPanel` | host/ 안이므로 Host 불필요, 역할 명확화 |
| `EventDetailHeader` | `DetailHeader` | events/ 안이므로 Event 불필요 |
| `EventTabSection` | `TabSection` | events/ 안이므로 Event 불필요 |
| `EventThumbnail` | `Thumbnail` | events/ 안이므로 Event 불필요 |

#### `events/[id]/_components/` 내
| Before | After | 이유 |
|---|---|---|
| `EventActionMenu` | `ActionMenu` | events/ 하위이므로 Event 불필요 |
| `EventReviewSection` | `ReviewSection` | events/ 하위이므로 Event 불필요 |

> **예외:** `EventForm` — `Form`으로 줄이면 범용적이라 유지
> **예외:** `HostProfile` — 1곳에서만 사용하므로 `host/events/[id]/_components/`에 그대로 유지 (공통 승격 안 함)

### 5. types.ts 제거 → Hook 내부로 통합

| Before | After |
|---|---|
| `host/events/[id]/types.ts` (별도 파일) | `host/events/[id]/useEventDetail.ts` 상단에 타입 선언 + export |

### 6. CSS 모듈 신규 생성 (Rule 2 위반 해소)

| 대상 | 현 상태 | 변경 |
|---|---|---|
| `BackButton` | `../page.module.css` 참조 | `components/ui/BackButton/BackButton.module.css` 전용 |
| `ReviewSection` | 전체 인라인 스타일 | `ReviewSection.module.css` 신규 생성 |
| `host/events/new/page.tsx` | 인라인 스타일 | `page.module.css` 신규 생성 |
| `host/events/[id]/edit/page.tsx` | 인라인 스타일 | `page.module.css` 신규 생성 |

### 7. Hook 추출 (Rule 3 적용)

| Hook | 추출 대상 | 위치 (Rule 6 적용) |
|---|---|---|
| `useEvents.ts` | fetchEvents, search, pagination 상태 | `events/` (page.tsx 옆) |
| `useHostEvents.ts` | fetchEvents, tab 필터, pagination 상태 | `host/events/` (page.tsx 옆) |
| `useEventDetail.ts` | fetchDetail, fetchAttendees + 타입 선언 | `host/events/[id]/` (page.tsx 옆) |
| `useTicketCart.ts` | 장바구니 추가/중복체크 API 로직 | `events/[id]/_components/TicketList/` (호출자 옆) |
| `useEventReviews.ts` | fetchReviews, reviews 상태 | `events/[id]/_components/ReviewSection/` (호출자 옆) |

---

## URL 경로 변경에 따른 참조 수정

> [!WARNING]
> 프로젝트 전체에서 아래 경로를 검색하여 수정해야 합니다:
> - `/events/new` → `/host/events/new`
> - `/events/${id}/edit` → `/host/events/${id}/edit`
> - `ActionMenu.tsx` 내 edit 라우팅 경로

> [!IMPORTANT]
> ### EventForm.tsx 내부 코드 리팩토링 (1423줄)은 이번 스코프 제외
> 이번에는 **위치 이동 + 폴더화 + 리네이밍**만 진행합니다.
> EventForm 내부 쪼개기(섹션 분할, 훅 추출 등)는 별도 티켓으로 분리합니다.
