# 프론트엔드 규칙 — VenueOn Next.js

## 기술 스택
- Next.js 16+ (App Router), React 19, TypeScript
- Vanilla CSS Module (컴포넌트별 스코프 CSS)
- Zustand (전역 상태: auth, UI)
- iron-session (서버 사이드 JWT 관리)
- BFF 패턴: Next.js API Routes → Spring Boot

## 레이아웃 아키텍처
- **Root Layout 1개** — `app/layout.tsx`: Header + `<main>` + Footer + Toast
- **Header** — `usePathname()`으로 role 자동 감지 (기본/호스트/어드민)
- **Footer** — `/admin` 경로에서 숨김
- **콘텐츠 패턴 3가지:**
  - `container-full` — 목록 페이지 (이벤트 리스트, 커뮤니티 목록 등)
  - `container-single` — 상세/폼 페이지 (이벤트 상세, 생성/수정 등)
  - `container-sidebar` — 대시보드 페이지 (admin, host, mypage)
- **Sidebar** — page.tsx에서 직접 import, Route Group/중첩 Layout 없음

## 폴더 구조 원칙

### 페이지 구조
```
app/some-page/
├── page.tsx                  # 150줄 이하! 레이아웃 + 조합만
├── page.module.css
└── _components/              # 페이지 전용 컴포넌트 (동시 생성 필수!)
    ├── SomeSection/
    │   ├── SomeSection.tsx
    │   ├── SomeSection.module.css
    │   └── index.ts
    └── AnotherSection/
```

### 컴포넌트 구조

**모든 컴포넌트는 폴더로 생성 — 예외 없음:**
```
ComponentName/
├── ComponentName.tsx         # 컴포넌트 로직
├── ComponentName.module.css  # 전용 스타일 (다른 컴포넌트와 공유 금지)
└── index.ts                  # re-export
```

### 공유 vs 페이지 전용 구분
- 2개 이상 페이지에서 사용 → `components/`
- 특정 페이지에서만 사용 → 해당 페이지의 `_components/`

## API 함수 규칙
```
lib/api/
├── client.ts         # 공통 fetch wrapper
├── authAPI.ts        # 인증 API
├── eventAPI.ts       # 이벤트 API
├── hostAPI.ts        # 호스트 API
├── adminAPI.ts       # 관리자 API
├── communityAPI.ts   # 커뮤니티 API
├── orderAPI.ts       # 주문 API
├── contactAPI.ts     # 문의 API
└── index.ts          # re-export
```
- 도메인별 별도 파일로 분리
- 공통 fetch wrapper(`client.ts`)에 한 번만 정의

## BFF 라우트 핸들러
```
app/api/[...path]/
├── route.ts              # 라우터 (분기만, ~40줄)
└── handlers/
    ├── authHandlers.ts   # 인증 핸들러
    └── proxyHandler.ts   # 일반 API 프록시
```

## 파일 크기 기준
| 크기 | 상태 |
|------|------|
| ~150줄 | ✅ 적정 |
| 150~300줄 | ⚠️ 분리 검토 |
| 300줄 이상 | 🔴 즉시 분리 |
| 500줄 이상 | 🚨 아키텍처 위반 |

## 복잡한 컴포넌트 패턴
- **Feature Component + Custom Hook** 패턴 적용:
  - `use{Feature}.ts` — API 호출, 상태 관리, 비즈니스 로직
  - `{Feature}.tsx` — UI 렌더링만
- 컴포넌트 300줄 초과 시 서브 컴포넌트 분리

## 전역 상태 (Zustand)
- 관심사별 스토어 분리: `useAuthStore`, `useUIStore` 등
- JWT는 Zustand에 저장하지 않음 (iron-session으로 서버 관리)

## v7 코드 테이블 대응
- 상태 비교: `status.id === 2` (숫자 ID 기반)
- 화면 표시: `status.label` → "발행됨"
- 상수 참조: `CodeConstants` (DRAFT=1, PUBLISHED=2, ONGOING=3, ENDED=4, CANCELLED=5)

## 금지 패턴
- ❌ page.tsx에 모든 로직 직접 작성 (150줄 이상이면 _components/ 분리)
- ❌ 컴포넌트를 폴더 없이 단독 파일로 생성
- ❌ CSS Module을 다른 컴포넌트와 공유
- ❌ API 함수를 하나의 파일에 전부 작성
- ❌ BFF route.ts에 모든 핸들러 로직 작성
- ❌ 코드 복붙 (2번 이상 사용 시 공유 컴포넌트로 추출)
