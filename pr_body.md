## VO-874 호스트 모듈 프론트엔드 비표준 패턴 리팩토링 & 버그 수정

### 📋 개요
`host/` 모듈 전반의 비표준 UI 패턴을 프로젝트 공통 컴포넌트로 교체하고, 백엔드 프로필 관련 오류를 수정했습니다.

### ✅ 변경 내역

#### 1. 레이아웃 래퍼 표준화
모든 `host/` 하위 페이지의 레이아웃을 `container-sidebar` > `Sidebar` + `sidebar-content` 패턴으로 통일했습니다.
- `host/page.tsx` (대시보드)
- `host/attendees/page.tsx` (수강생 관리)
- `host/payments/page.tsx` (주문 내역)
- `host/payments/[id]/page.tsx` (주문 상세)
- `host/events/page.tsx` (이벤트 목록)
- `host/profile/page.tsx` (프로필 설정)

#### 2. 공통 `<Table>` 컴포넌트 도입
수동 `<table>` HTML 구현을 공통 `Table`, `TableHeader`, `TableRow`, `TableCell` 컴포넌트로 교체했습니다.
- `host/page.tsx` — 대시보드 최근 주문 테이블
- `host/payments/page.tsx` — 전체 주문 내역 테이블
- `host/attendees/page.tsx` — 수강생 관리 테이블

#### 3. 공통 `<Pagination>` 컴포넌트 도입
수동으로 구현된 이전/다음 버튼 및 페이지 번호 UI를 공통 `Pagination` 컴포넌트로 교체했습니다.
- `host/payments/page.tsx`
- `host/events/page.tsx`

#### 4. `<StatusTag>` 컴포넌트로 상태 매핑 통일
각 페이지에 하드코딩되어 있던 `switch/case` 상태 텍스트 매핑 함수와 수동 CSS 클래스 매핑을 모두 제거하고, 공통 `<StatusTag domain="..." status={...} />` 컴포넌트로 교체했습니다.

**영향 파일:**
- `host/page.tsx` (대시보드)
- `host/payments/page.tsx` (주문 목록)
- `host/payments/[id]/page.tsx` (주문 상세)
- `host/attendees/page.tsx` (수강생 관리)
- `host/events/page.tsx` (이벤트 목록 — ID 기반 비교로 변경)
- `host/events/[id]/_components/DetailHeader.tsx` (이벤트 상세 헤더)
- `orders/refund/page.tsx` (수강 취소)
- `mypage/orders/[id]/page.tsx` (결제 상세)

#### 5. CSS 모듈 의존성 분리
- `host/attendees/page.tsx`가 부모 디렉터리의 `../page.module.css`를 import하던 비표준 구조를 해소
- `host/attendees/page.module.css` 전용 CSS 모듈을 새로 생성하여 자체 의존성으로 변경

#### 6. 사이드바 대시보드 Active 상태 버그 수정
`Sidebar.tsx`에서 `/host`, `/mypage` 등 대시보드 메뉴가 하위 페이지 진입 시에도 계속 활성화 상태로 표시되던 버그를 수정했습니다.
- 대시보드 경로는 `pathname === menu.href` (정확 일치)로만 활성화
- 그 외 메뉴는 기존대로 `startsWith` 매칭 유지

#### 7. 백엔드: 호스트 프로필 자동 생성
신규 호스트 계정이 `/host/profile` 접근 시 `400 Bad Request`가 발생하던 오류를 수정했습니다.
- `HostProfileService.getHostProfile()`에서 프로필 미존재 시 기본값으로 자동 생성하도록 변경
- `@Transactional` 추가 (읽기 + 쓰기 혼합 트랜잭션)
- `org_number`, `org_description` 등 NOT NULL 컬럼을 빈 문자열로 초기화하여 `DataIntegrityViolationException` 해결

#### 8. 대시보드 UI 개선
- 사용하지 않는 "환불요청 대기" 요약 카드 제거
- 최근 주문 내역 테이블 컬럼 비율 최적화 (`60px minmax(0, 1fr) 90px 90px 80px`)로 강의명 노출 영역 확대

### 📁 주요 변경 파일 (43개)
| 영역 | 파일 수 | 내용 |
|---|---|---|
| `frontend/src/app/host/` | 10 | 레이아웃, Table, Pagination, StatusTag 표준화 |
| `frontend/src/app/events/` | 3 | StatusTag 적용, 이벤트 목록 리팩토링 |
| `frontend/src/app/orders/` | 1 | StatusTag 적용 |
| `frontend/src/app/mypage/` | 1 | StatusTag 적용 |
| `frontend/src/components/` | 2 | Sidebar 버그 수정, UI index export 추가 |
| `backend/` | 1 | HostProfileService 자동 생성 로직 |
| `docs/` | 4 | 기술 문서 (비표준 패턴 분석, API 수정 방안 등) |

### 🧪 테스트 방법
1. 호스트 계정으로 로그인
2. `/host` 대시보드 → 사이드바 메뉴 전환 시 Active 상태 확인
3. `/host/payments` → 테이블 렌더링 및 페이지네이션 확인
4. `/host/attendees` → 테이블 렌더링 및 필터 확인
5. `/host/profile` → 신규 호스트 접근 시 빈 폼 정상 표시 확인
6. `/host/events` → 이벤트 카드 상태 뱃지 정상 표시 확인
