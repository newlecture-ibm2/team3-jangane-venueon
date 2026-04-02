# 📋 VenueOn WBS v5 — 기능/UseCase 단위 · MoSCoW 우선순위

> **작성일:** 2026-04-02  
> **기반:** [VenueOn_최종_기능_페이지_정의서.md](./VenueOn_최종_기능_페이지_정의서.md) (v2)  
> **방법론:** 애자일 스프린트 기반 · MoSCoW 우선순위  
> **상태 관리:** `TODO` → `IN_PROGRESS` → `REVIEW` → `DONE`

---

## 📌 MoSCoW 분류 기준

| 등급 | 의미 | 설명 |
|------|------|------|
| **M** (Must Have) | 반드시 필요 | 이것 없이는 서비스 런칭 불가. MVP 핵심 + 필수 연동 기능 |
| **S** (Should Have) | 중요하지만 필수 아님 | 없으면 불편하지만 런칭은 가능. 1차 릴리즈 이후 빠르게 추가 |
| **C** (Could Have) | 있으면 좋음 | UX 향상, 차별화 기능. 여유가 있을 때 구현 |
| **W** (Won't Have this time) | 이번에는 안 함 | 향후 확장 예정. 현재 스프린트에서는 제외 |

---

## 📌 Sprint 구성 제안

| Sprint | 기간 | 테마 | MoSCoW |
|--------|------|------|--------|
| Sprint 1 | 1주차 | 인증 인프라 + 이벤트 기본 | M |
| Sprint 2 | 2주차 | 결제 + 이벤트 고도화 | M + S |
| Sprint 3 | 3주차 | 커뮤니티 + 마이페이지 | M + S |
| Sprint 4 | 4주차 | 어드민 + 호스트 고도화 | S + C |
| Sprint 5 | 5주차 | 뱃지 + 알림 + 공지 시스템 | C |
| Sprint 6 | 6주차 | 폴리싱 + 추가 기능 | C + W buffer |

---

## 🏗️ WBS — 전체 UseCase 목록

### Epic 1. 인증 / 사용자 관리

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| A-001 | 이메일/비밀번호 회원가입 | `/auth/signup` | BE+FE | **M** | 1 | TODO | 이메일, 비밀번호, 닉네임 입력 |
| A-002 | 이메일 중복 확인 API | `/auth/signup` | BE | **M** | 1 | TODO | 실시간 중복 체크 |
| A-003 | 이메일 인증 코드 발송/검증 | `/auth/signup` | BE | **M** | 1 | TODO | 인증 코드 발송 + 검증 후 가입 완료 |
| A-004 | 약관 동의 UI | `/auth/signup` | FE | **M** | 1 | TODO | 이용약관, 개인정보 처리방침 동의 |
| A-005 | 이메일/비밀번호 로그인 | `/auth/login` | BE+FE | **M** | 1 | TODO | JWT Access+Refresh 발급 |
| A-006 | 토큰 갱신 (Refresh) | - | BE | **M** | 1 | TODO | Refresh Token → 새 Access Token |
| A-007 | 로그아웃 (토큰 블랙리스트) | - | BE | **M** | 1 | TODO | Redis 블랙리스트 |
| A-008 | Google OAuth2 소셜 로그인 | `/auth/login` | BE+FE | **S** | 2 | TODO | Google만 |
| A-009 | Google OAuth2 소셜 회원가입 | `/auth/signup` | BE+FE | **S** | 2 | TODO | Google 연동 가입 |
| A-010 | 비밀번호 분실 → 임시 비밀번호 발송 | `/auth/forgot-password` | BE+FE | **S** | 2 | TODO | 이메일로 임시 비밀번호 전송 |
| A-011 | 호스트 전용 회원가입 | `/host/signup` | BE+FE | **M** | 1 | TODO | 사업자등록번호 인증 기반 |
| A-012 | 호스트 전용 로그인 | `/host/login` | BE+FE | **M** | 1 | TODO | HOST 역할 로그인 |
| A-013 | 호스트 이메일 검증 | `/host/signup` | BE | **S** | 2 | TODO | 호스트도 이메일 인증 코드 |

---

### Epic 2. 이벤트(강의) 관리

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| E-001 | 이벤트 목록 조회 (검색/필터/페이징) | `/events` | BE+FE | **M** | 1 | TODO | 카테고리, 타입별 필터 |
| E-002 | 이벤트 목록 페이지네이션 | `/events` | FE | **M** | 1 | TODO | 무한 스크롤 X, 페이지네이션 |
| E-003 | 이벤트 지역별 필터링 | `/events` | BE+FE | **S** | 2 | TODO | 시/도, 구/군 필터 |
| E-004 | 이벤트 캘린더 날짜별 필터링 | `/events` | FE+BE | **S** | 2 | TODO | 달력 UI → 날짜 선택 필터 |
| E-005 | 정렬 옵션 (최신/인기/가격/평점) | `/events` | BE+FE | **C** | 4 | TODO | 정렬 쿼리 파라미터 |
| E-006 | 이벤트 상세 조회 | `/events/[id]` | BE+FE | **M** | 1 | TODO | 제목, 설명, 일정, 가격 표시 |
| E-007 | 수강 신청 모달 | `/events/[id]` | FE | **M** | 1 | TODO | 인원 수 + 결제 방법 선택 |
| E-008 | 이벤트 신고 모달 | `/events/[id]` | FE+BE | **S** | 3 | TODO | 강의 신고 |
| E-009 | 세션 링크 표시/연결 | `/events/[id]` | FE | **S** | 2 | TODO | Zoom 등 온라인 세션 링크 |
| E-010 | 할인 가격 표시 | `/events/[id]` | FE | **S** | 2 | TODO | 할인율, 할인 가격, 기간 |
| E-011 | 찜하기 버튼 | `/events/[id]` | BE+FE | **S** | 3 | TODO | 찜 목록 추가/해제 |
| E-012 | 리뷰 목록 표시 + 평균 평점 | `/events/[id]` | BE+FE | **S** | 2 | TODO | 리뷰 리스트 + 별점 |
| E-013 | 관련 강의 추천 | `/events/[id]` | BE+FE | **C** | 5 | TODO | 같은 카테고리/호스트 강의 |
| E-014 | 소셜 공유 버튼 | `/events/[id]` | FE | **C** | 5 | TODO | URL 복사, SNS 공유 |

---

### Epic 3. 이벤트 생성/수정 (호스트)

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| EC-001 | Step 1: 기본 정보 입력 (제목, 설명) | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | 강의 제목, 설명 입력 |
| EC-002 | Step 1: 대표 이미지 업로드 | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | 썸네일 이미지 업로드 |
| EC-003 | Step 1: Rich Editor (WYSIWYG) | `/host/seminars/new` | FE | **S** | 2 | TODO | 상세 설명 에디터 |
| EC-004 | Step 1: 카테고리 선택 | `/host/seminars/new` | FE+BE | **S** | 2 | TODO | 어드민 관리 카테고리 목록 |
| EC-005 | Step 2: 날짜/시간 설정 | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | 시작·종료 일시 |
| EC-006 | Step 2: 온라인/오프라인 선택 + 장소 | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | 토글 + 장소 입력 |
| EC-007 | Step 2: 지역 정보 입력 (시/도, 구/군) | `/host/seminars/new` | FE+BE | **S** | 2 | TODO | 지역별 필터 연동 |
| EC-008 | Step 2: 온라인 세션 링크 입력 | `/host/seminars/new` | BE+FE | **S** | 2 | TODO | Zoom URL 입력 |
| EC-009 | Step 3: 세션 리스트 CRUD | `/host/seminars/new` | BE+FE | **S** | 2 | TODO | 복수 세션 등록/삭제/순서변경 |
| EC-010 | Step 4: 무료/유료 + 가격 설정 | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | 가격 설정 |
| EC-011 | Step 4: 최대 수강 인원 설정 | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | 정원 제한 |
| EC-012 | Step 4: 할인 설정 | `/host/seminars/new` | BE+FE | **S** | 2 | TODO | 할인율/기간 설정 |
| EC-013 | Step 4: 패키지 강의 등록 | `/host/seminars/new` | BE+FE | **C** | 4 | TODO | 내 강의 목록에서 패키지 묶기 |
| EC-014 | 미리보기 기능 | `/host/seminars/new` | FE | **S** | 2 | TODO | 카드 미리보기 화면 |
| EC-015 | 임시 저장 (Draft) | `/host/seminars/new` | BE+FE | **S** | 2 | TODO | Draft 상태 저장 |
| EC-016 | 강의 게시 (Publish) | `/host/seminars/new` | BE+FE | **M** | 1 | TODO | Published 상태 전환 |
| EC-017 | 취소 확인 모달 + 변경 감지 | `/host/seminars/new` | FE | **S** | 2 | TODO | dirty check + 뒤로가기 가드 |
| EC-018 | 이벤트 수정 (프리필 + 수정 완료) | `/host/seminars/[id]/edit` | BE+FE | **M** | 1 | TODO | 기존 데이터 로드 + 수정 저장 |
| EC-019 | Published 상태 필드 변경 경고 | `/host/seminars/[id]/edit` | FE | **C** | 4 | TODO | 가격/일정 변경 시 경고 |

---

### Epic 4. 리뷰 시스템

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| R-001 | 수강 후 리뷰 작성 (별점+텍스트) | `/events/[id]` | BE+FE | **S** | 2 | TODO | 수강 완료 유저만 |
| R-002 | 리뷰 작성 자격 검증 | `/events/[id]` | BE | **S** | 2 | TODO | ORDER 완료 상태 확인 |
| R-003 | 리뷰 중복 방지 (1인 1리뷰) | `/events/[id]` | BE | **S** | 2 | TODO | 중복 체크 |
| R-004 | 리뷰 수정/삭제 | `/events/[id]` | BE+FE | **S** | 2 | TODO | 본인 리뷰 CRUD |
| R-005 | 어드민 리뷰 관리 (숨김/삭제/수정) | `/admin/reviews` | BE+FE | **C** | 4 | TODO | 관리자 리뷰 CRUD |
| R-006 | 리뷰 좋아요 | `/events/[id]` | BE+FE | **C** | 5 | TODO | 도움이 됐어요 |
| R-007 | 리뷰 사진 첨부 | `/events/[id]` | BE+FE | **C** | 5 | TODO | 이미지 업로드 |

---

### Epic 5. 커뮤니티

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| CM-001 | 커뮤니티 목록 조회 | `/community` | BE+FE | **M** | 1 | TODO | 이벤트 기반 목록 |
| CM-002 | 오픈/닫힌 커뮤니티 필터 | `/community` | FE+BE | **S** | 3 | TODO | 공개/비공개 필터 |
| CM-003 | 커뮤니티 상세 (게시글 CRUD + 댓글) | `/community/[id]` | BE+FE | **M** | 1 | TODO | 게시글/댓글 기본 CRUD |
| CM-004 | 게시물 타입 필터 | `/community/[id]` | FE | **M** | 3 | TODO | GENERAL/REVIEW/QUESTION/NOTICE |
| CM-005 | 게시물 좋아요 | `/community/[id]` | BE+FE | **S** | 3 | TODO | 게시글 좋아요/공감 |
| CM-006 | 댓글 좋아요 | `/community/[id]` | BE+FE | **S** | 3 | TODO | 댓글 좋아요 |
| CM-007 | 대댓글 기능 | `/community/[id]` | BE+FE | **S** | 3 | TODO | parent_id 기반 |
| CM-008 | 공지사항 등록 (상단 고정) | `/community/[id]` | BE+FE | **S** | 3 | TODO | 관리자 공지 등록 |
| CM-009 | 관리자 게시글 상단 고정 (pin) | `/community/[id]` | BE+FE | **S** | 3 | TODO | 마음에 드는 글 pin |
| CM-010 | 인기글 기능 | `/community/[id]` | BE+FE | **C** | 4 | TODO | 인기글 섹션 |
| CM-011 | 인기글 기준 설정 (관리자) | `/community/[id]` | BE+FE | **C** | 4 | TODO | 좋아요/댓글/조회 가중치 |
| CM-012 | 건의 버튼 (호스트/어드민 요청) | `/community/[id]` | FE+BE | **C** | 4 | TODO | 요청 전송 |
| CM-013 | 뱃지 기반 읽기/쓰기 권한 | `/community/[id]` | BE+FE | **C** | 5 | TODO | 뱃지 보유로 권한 설정 |
| CM-014 | 게시물 검색 | `/community/[id]` | BE+FE | **C** | 5 | TODO | 커뮤니티 내 검색 |
| CM-015 | 멤버 목록 + 권한 표시 | `/community/[id]` | FE | **C** | 5 | TODO | 관리자/부관리자/일반 구분 |
| CM-016 | 커뮤니티 생성 페이지 | `/community/new` | BE+FE | **S** | 3 | TODO | 생성 전용 페이지 |
| CM-017 | 커뮤니티 수정 페이지 | `/community/[id]/edit` | BE+FE | **S** | 3 | TODO | 수정 전용 페이지 |
| CM-018 | 오픈/닫힌 설정 | `/community/new` | BE+FE | **S** | 3 | TODO | 공개/비공개 설정 |
| CM-019 | 어드민 컨펌 후 개설 | `/community/new` | BE | **C** | 5 | TODO | 어드민 승인 후 활성화 |
| CM-020 | 커뮤니티 글 에디터 (Rich Editor) | `/community/new` | FE | **S** | 3 | TODO | WYSIWYG 에디터 |
| CM-021 | 사용자 상태 리스트 (관리자 뷰) | `/community/[id]` | BE+FE | **C** | 4 | TODO | 권한 등급 목록 |
| CM-022 | 사용자 권한 변경 | `/community/[id]` | BE+FE | **C** | 4 | TODO | 멤버 권한 등급 변경 |
| CM-023 | 게시물 저장(북마크) 버튼 | `/community/[id]` | BE+FE | **S** | 3 | TODO | 개별 게시물 북마크 |
| CM-024 | 인기 커뮤니티 섹션 | `/community` | BE+FE | **C** | 5 | TODO | 멤버 수 기반 |
| CM-025 | 뱃지 기반 커뮤니티 매칭 추천 | `/community` | BE+FE | **C** | 5 | TODO | 보유 뱃지 기반 추천 |

---

### Epic 6. 결제 / 장바구니

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| P-001 | 수강 신청 (더미 결제) | `/orders` | BE | **M** | 1 | TODO | 즉시 PAID 처리 |
| P-002 | 토스 페이먼츠 연동 (테스트 모드) | `/orders` | BE+FE | **M** | 2 | TODO | Toss SDK 결제 위젯 |
| P-003 | 결제 검증 (Webhook) | - | BE | **M** | 2 | TODO | 서버 사이드 결제 검증 |
| P-004 | 결제 실패 처리 + 재시도 | `/orders` | FE | **M** | 2 | TODO | 실패 시 안내 |
| P-005 | 결제 완료 페이지 | `/orders/[id]/complete` | FE | **M** | 2 | TODO | 주문 완료 정보 |
| P-006 | 결제 완료 페이지 고도화 (상세 내역) | `/orders/[id]/complete` | FE | **S** | 3 | TODO | 영수증, 커뮤니티 바로가기 |
| P-007 | 참가 취소 | `/orders/[id]/cancel` | BE+FE | **M** | 2 | TODO | 주문 취소 |
| P-008 | 환불 요청 | `/orders/[id]/refund` | BE+FE | **S** | 3 | TODO | 환불 신청 생성 |
| P-009 | 결제 수단 등록 | `/mypage/payment-methods` | BE+FE | **C** | 4 | TODO | 카드/간편결제 사전 등록 |
| P-010 | 수강 바구니 (장바구니) | `/cart` | BE+FE | **S** | 3 | TODO | 장바구니 담기 |
| P-011 | 장바구니 수량 변경/삭제 | `/cart` | FE | **S** | 3 | TODO | 인원 수 변경, 삭제 |
| P-012 | 장바구니 일괄 결제 | `/cart` | BE+FE | **S** | 3 | TODO | 여러 강의 한 번에 결제 |
| P-013 | 장바구니 비로그인 유지 | `/cart` | FE | **C** | 5 | TODO | 로컬 저장 |
| P-014 | 결제 확인 이메일 발송 | - | BE | **C** | 5 | TODO | 결제 완료 이메일 |

---

### Epic 7. 마이페이지

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| MY-001 | 마이페이지 메인 (프로필 요약) | `/mypage` | FE | **M** | 1 | TODO | 닉네임, 프로필 이미지 |
| MY-002 | 프로필 사진 변경/삭제 | `/mypage` | BE+FE | **M** | 1 | TODO | 이미지 변경/삭제 |
| MY-003 | 결제 내역 페이지 | `/mypage/orders` | BE+FE | **M** | 2 | TODO | 주문 목록 페이징 |
| MY-004 | 결제 내역 상세 보기 | `/mypage/orders` | FE | **S** | 3 | TODO | 금액, 수단, 환불 상태 |
| MY-005 | 환불 신청 버튼 | `/mypage/orders` | FE | **S** | 3 | TODO | 결제 내역에서 환불 요청 |
| MY-006 | 내 강의 관리 (수강중/완료 탭) | `/mypage/events` | BE+FE | **M** | 3 | TODO | 탭으로 필터 전환 |
| MY-007 | 수강 중 탭: 강의 입장 버튼 | `/mypage/events` | FE | **S** | 3 | TODO | 세션 바로 입장 |
| MY-008 | 수강 완료 탭: 뱃지 표시 | `/mypage/events` | FE | **C** | 5 | TODO | 완료 강의 뱃지 표시 |
| MY-009 | 수강 완료 탭: 리뷰 작성 유도 | `/mypage/events` | FE | **S** | 3 | TODO | 미작성 리뷰 유도 UI |
| MY-010 | 찜 목록 페이지 | `/mypage/wishlist` | BE+FE | **S** | 3 | TODO | 찜한 이벤트 리스트 |
| MY-011 | 찜 해제 + 장바구니 담기 | `/mypage/wishlist` | FE | **S** | 3 | TODO | 찜 해제/장바구니 이동 |
| MY-012 | 내 커뮤니티: 탭 1 - 참여 중 | `/mypage/communities` | BE+FE | **M** | 3 | TODO | 가입 커뮤니티 목록 |
| MY-013 | 내 커뮤니티: 탭 2 - 커뮤니티 북마크 | `/mypage/communities` | BE+FE | **S** | 3 | TODO | 북마크한 커뮤니티 |
| MY-014 | 내 커뮤니티: 탭 3 - 내가 쓴 게시물 | `/mypage/communities` | BE+FE | **S** | 3 | TODO | 전체 커뮤니티 통합 |
| MY-015 | 내 커뮤니티: 탭 4 - 게시물 북마크 | `/mypage/communities` | BE+FE | **S** | 3 | TODO | 저장한 게시물 |
| MY-016 | 프로필 설정: 닉네임/이미지 수정 | `/mypage/profile` | BE+FE | **M** | 1 | TODO | 기본 프로필 수정 |
| MY-017 | 프로필 설정: 비밀번호 변경 | `/mypage/profile` | BE+FE | **M** | 2 | TODO | 현재 PW 확인 → 변경 |
| MY-018 | 프로필 설정: 관심 카테고리 등록 | `/mypage/profile` | BE+FE | **S** | 3 | TODO | 관심 카테고리 복수 선택 |
| MY-019 | 프로필 설정: 뱃지 노출 여부 | `/mypage/profile` | BE+FE | **C** | 5 | TODO | 뱃지 공개/비공개 토글 |
| MY-020 | 프로필 설정: 계정 탈퇴 | `/mypage/profile` | BE+FE | **C** | 5 | TODO | 회원 탈퇴 |
| MY-021 | 대시보드 요약 카드 | `/mypage` | FE | **C** | 5 | TODO | 수강중/완료/찜 한눈에 |

---

### Epic 8. 알림 시스템

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| N-001 | 알림 테이블/API 설계 | - | BE | **S** | 3 | TODO | 알림 도메인 모듈 |
| N-002 | 알림 목록 (쌓이는 방식) | `/mypage/notifications` | BE+FE | **S** | 3 | TODO | 시간순 누적 표시 |
| N-003 | 알림: 내 게시물 댓글 | - | BE | **S** | 3 | TODO | 새 댓글 알림 생성 |
| N-004 | 알림: 강의 관련 (일정 변경 등) | - | BE | **S** | 3 | TODO | 강의 관련 알림 |
| N-005 | 알림: 제재 내역 | - | BE | **S** | 4 | TODO | 경고/정지 알림 |
| N-006 | 알림: 결제 관련 | - | BE | **S** | 3 | TODO | 결제/환불 알림 |
| N-007 | 알림: 내 신고 처리 결과 | - | BE | **S** | 4 | TODO | 신고 처리 결과 알림 |
| N-008 | 알림 읽음/안읽음 처리 | `/mypage/notifications` | BE+FE | **S** | 3 | TODO | 읽음 처리 |
| N-009 | 헤더 알림 아이콘 + 미확인 카운트 | 글로벌 헤더 | FE+BE | **S** | 3 | TODO | 벨 아이콘 + 배지 |
| N-010 | 알림 설정 (카테고리별 On/Off) | `/mypage/notifications` | BE+FE | **C** | 5 | TODO | 수신 여부 설정 |

---

### Epic 9. 호스트

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| H-001 | 호스트 센터 랜딩 | `/host` | FE | **M** | 1 | TODO | 서비스 소개 + 가입 유도 |
| H-002 | 호스트 대시보드 (요약) | `/host/dashboard` | BE+FE | **M** | 2 | TODO | 총 이벤트, 매출, 최근 주문 |
| H-003 | 수강생 목록 조회 | `/host/events/[id]/attendees` | BE+FE | **M** | 2 | TODO | 수강생 관리 |
| H-004 | 내가 등록한 이벤트 목록 | `/host/events` | BE+FE | **M** | 1 | TODO | 상태별 필터 |
| H-005 | 이벤트 상태 변경 (DRAFT→PUBLISHED) | `/host/events` | BE+FE | **M** | 1 | TODO | 상태 PATCH |
| H-006 | 수강생 현황 표시 | `/host/events` | FE | **S** | 2 | TODO | 신청/최대 인원 표시 |
| H-007 | 호스트 결제 내역 목록 | `/host/payments` | BE+FE | **S** | 3 | TODO | 전체 결제 내역 |
| H-008 | 이벤트별 결제 필터 | `/host/payments` | FE | **S** | 3 | TODO | 특정 이벤트 필터 |
| H-009 | 호스트 지정 환불 처리 | `/host/payments` | BE+FE | **S** | 3 | TODO | 직접 환불 처리 |
| H-010 | 환불 사유 입력 + 이력 조회 | `/host/payments` | BE+FE | **S** | 3 | TODO | 사유 기록/이력 |
| H-011 | 호스트 요청 게시판 | `/host/requests` | BE+FE | **C** | 4 | TODO | 어드민/관리자 요청 |
| H-012 | 요청 카테고리 선택 | `/host/requests` | FE | **C** | 4 | TODO | 커뮤니티/리뷰/코멘트 |
| H-013 | 요청 상태 추적 | `/host/requests` | BE+FE | **C** | 4 | TODO | PENDING→APPROVED/REJECTED |
| H-014 | 호스트 기업 프로필 편집 | `/host/profile` | BE+FE | **M** | 2 | TODO | 회사명, 로고, 연락처 |
| H-015 | 매출 차트/통계 | `/host/dashboard` | FE | **C** | 5 | TODO | 일별/월별 시각화 |

---

### Epic 10. 어드민

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| AD-001 | 어드민 대시보드 요약 | `/admin` | BE+FE | **M** | 2 | TODO | 총 회원/강의/신고/환불 |
| AD-002 | 긴급 처리 항목 | `/admin` | BE+FE | **M** | 2 | TODO | 환불 대기 + 긴급 신고 |
| AD-003 | 전체 회원 리스트 | `/admin/users` | BE+FE | **M** | 2 | TODO | 키워드/역할 필터 |
| AD-004 | 주최자/수강생 분리 조회 | `/admin/users` | FE | **M** | 2 | TODO | hosts/students 탭 |
| AD-005 | 회원 상세 프로필 | `/admin/users/[id]` | BE+FE | **M** | 2 | TODO | 프로필 + 활동 이력 |
| AD-006 | 회원 삭제 (비활성화) | `/admin/users/[id]` | BE | **M** | 2 | TODO | is_active=false |
| AD-007 | 회원 경고 | `/admin/users/[id]` | BE+FE | **S** | 4 | TODO | 경고 발송 |
| AD-008 | 회원 정지 (일시/영구) | `/admin/users/[id]` | BE+FE | **S** | 4 | TODO | 정지 처리 |
| AD-009 | 권한 수정 (USER↔HOST↔ADMIN) | `/admin/users/[id]` | BE+FE | **S** | 4 | TODO | 역할 변경 |
| AD-010 | 정지 이력 관리 | `/admin/users/[id]` | BE+FE | **S** | 4 | TODO | 사유/기간/이력 |
| AD-011 | 카테고리 CRUD | `/admin/categories` | BE+FE | **S** | 2 | TODO | 카테고리 관리 |
| AD-012 | 카테고리 사용 현황 | `/admin/categories` | BE+FE | **S** | 2 | TODO | 카테고리별 이벤트 수 |
| AD-013 | 관심 카테고리 관리 | `/admin/interest-categories` | BE+FE | **S** | 4 | TODO | 관심 카테고리 항목 관리 |
| AD-014 | 관심 카테고리 통계 | `/admin/interest-categories` | BE+FE | **C** | 5 | TODO | 카테고리별 등록 유저 수 |
| AD-015 | 신고 목록 (필터) | `/admin/reports` | BE+FE | **M** | 3 | TODO | targetType/status 필터 |
| AD-016 | 신고 상세/처리 | `/admin/reports/[id]` | BE+FE | **M** | 3 | TODO | DELETE/HIDE/WARN/DISMISS |
| AD-017 | 신고 처리 단계 관리 | `/admin/reports` | BE+FE | **S** | 4 | TODO | 접수→검토→처리→완료 |
| AD-018 | 제재 상태 관리 | `/admin/reports` | BE+FE | **S** | 4 | TODO | 제재 내역/변경 |
| AD-019 | 이의 제기 게시판 | `/admin/reports` | BE+FE | **C** | 5 | TODO | 부당 신고 이의 접수 |
| AD-020 | 신고 이력 추적 | `/admin/reports` | BE | **S** | 4 | TODO | 반복 신고 탐지 |
| AD-021 | 커뮤니티 개설 요청 리스트 | `/admin/community-requests` | BE+FE | **C** | 5 | TODO | 뱃지 기반 개설 요청 |
| AD-022 | 요청 승인/거절 | `/admin/community-requests` | BE+FE | **C** | 5 | TODO | 개설 컨펌 |
| AD-023 | 어드민 요청 페이지 | `/admin/requests` | BE+FE | **C** | 4 | TODO | 호스트 건의 목록 |
| AD-024 | 요청 카테고리별 필터 | `/admin/requests` | FE | **C** | 4 | TODO | 카테고리 필터 |
| AD-025 | 요청 처리 (승인/거절) | `/admin/requests` | BE+FE | **C** | 4 | TODO | 실행/거부 |
| AD-026 | 리뷰 관리 (CRUD) | `/admin/reviews` | BE+FE | **C** | 4 | TODO | 리뷰 숨김/삭제/수정 |
| AD-027 | 환불 목록 (긴급 우선) | `/admin/refunds` | BE+FE | **M** | 3 | TODO | 환불 모니터링 |
| AD-028 | 환불 승인/거절 | `/admin/refunds` | BE+FE | **M** | 3 | TODO | 환불 처리 |
| AD-029 | 커뮤니티 제재 관리 | `/admin/communities/sanctions` | BE+FE | **C** | 5 | TODO | 제재 사용자 관리 |
| AD-030 | 실시간 통계 차트 | `/admin` | FE | **C** | 6 | TODO | 가입자/매출 추이 |
| AD-031 | 강의 관리 (숨김/삭제) | `/admin/events` | BE+FE | **S** | 4 | TODO | 강의 is_hidden 토글/삭제 |
| AD-032 | 콘텐츠 관리 (게시글/댓글 숨김) | `/admin/posts` | BE+FE | **S** | 4 | TODO | 게시글/댓글 is_hidden 토글 |

---

### Epic 11. 뱃지 시스템

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| B-001 | 뱃지 자동 발급 (수강 완료 시) | - | BE | **C** | 5 | TODO | ORDER COMPLETED → 뱃지 생성 |
| B-002 | 내 뱃지 목록 조회 | `/mypage/badges` | BE+FE | **C** | 5 | TODO | 보유 뱃지 표시 |
| B-003 | 뱃지 → 강의 상세 연결 | `/mypage/badges` | FE | **C** | 5 | TODO | 클릭 시 강의 상세 |
| B-004 | 뱃지 노출 여부 설정 | `/mypage/badges` | BE+FE | **C** | 5 | TODO | 공개/비공개 토글 |
| B-005 | 뱃지 기반 커뮤니티 매칭 | `/mypage/badges` | BE+FE | **W** | - | TODO | 우선 커뮤니티 추천 |
| B-006 | 뱃지 보유자 검색 (다중 필터) | `/badges/search` | BE+FE | **C** | 5 | TODO | 뱃지 복수 필터 검색 |
| B-007 | 뱃지 보유자 초대 | `/badges/search` | BE+FE | **C** | 5 | TODO | 커뮤니티 초대 |
| B-008 | 프라이버시 보호 (비공개 제외) | `/badges/search` | BE | **C** | 5 | TODO | 비공개 회원 제외 |
| B-009 | 뱃지 기반 커뮤니티 개설 | `/community/new` | BE+FE | **W** | - | TODO | 뱃지 선택 → 개설 |

---

### Epic 12. 사용자 공개 프로필

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| UP-001 | 공개 프로필 기본 정보 | `/users/[id]/profile` | BE+FE | **C** | 5 | TODO | 이미지, 닉네임, 가입일 |
| UP-002 | 보유 뱃지 목록 표시 | `/users/[id]/profile` | BE+FE | **C** | 5 | TODO | 공개 뱃지만 표시 |
| UP-003 | 활동 내역: 작성한 글 | `/users/[id]/profile` | BE+FE | **C** | 5 | TODO | 공개 커뮤니티만 |
| UP-004 | 활동 내역: 작성한 댓글 | `/users/[id]/profile` | BE+FE | **C** | 5 | TODO | 공개 커뮤니티만 |
| UP-005 | 활동 내역: 작성한 리뷰 | `/users/[id]/profile` | BE+FE | **C** | 5 | TODO | 강의 리뷰 |
| UP-006 | 활동 내역: 참여 커뮤니티 | `/users/[id]/profile` | BE+FE | **C** | 5 | TODO | 공개 커뮤니티만 |
| UP-007 | 커뮤니티 초대 버튼 | `/users/[id]/profile` | FE | **C** | 5 | TODO | 내 커뮤니티에 초대 |
| UP-008 | 사용자 신고 버튼 | `/users/[id]/profile` | FE+BE | **C** | 5 | TODO | targetType: USER |
| UP-009 | 활동 통계 요약 카드 | `/users/[id]/profile` | FE | **W** | - | TODO | 게시물/댓글/리뷰/뱃지 수 |

---

### Epic 13. 공지 / 게시판 시스템

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| NB-001 | 전체 통합 공지 게시판 | `/notice` | BE+FE | **C** | 5 | TODO | 이용안내/공지/문의/QnA |
| NB-002 | 공지 카테고리 분류 | `/notice` | FE | **C** | 5 | TODO | 카테고리별 탭/필터 |
| NB-003 | 신고 이의 제기 게시판 | `/notice` | BE+FE | **C** | 5 | TODO | 부당 신고 이의 제기 |
| NB-004 | 요청 게시판 (호스트용) | `/requests` | BE+FE | **C** | 4 | TODO | 호스트 → 어드민 요청 |
| NB-005 | 커뮤니티 관리자 요청 페이지 | `/community/[id]/requests` | BE+FE | **C** | 4 | TODO | 호스트 요청 처리 |
| NB-006 | 공지 알림 연동 | - | BE | **W** | - | TODO | 새 공지 시 알림 |

---

### Epic 14. 메인 홈

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| MH-001 | 메인 홈 이벤트 목록 / 검색 | `/` | BE+FE | **M** | 1 | TODO | 기본 목록 + 검색 |
| MH-002 | 인기 이벤트 섹션 | `/` | BE+FE | **M** | 1 | TODO | 조회수/참여순 상위 |
| MH-003 | 관심 카테고리 기반 이벤트 노출 | `/` | BE+FE | **S** | 3 | TODO | 마이페이지 관심 카테고리 연동 |
| MH-004 | 전체 통합 공지 배너 | `/` | FE | **S** | 4 | TODO | 상단 배너 |
| MH-005 | 최근 본 이벤트 | `/` | FE | **C** | 5 | TODO | 로컬 저장 |
| MH-006 | 추천 이벤트 (뱃지 기반) | `/` | BE+FE | **W** | - | TODO | 뱃지 기반 추천 |

---

### Epic 15. 신고 데이터 모델 확장

| ID | UseCase | 페이지 | 담당 | MoSCoW | Sprint | 상태 | 비고 |
|----|---------|--------|------|--------|--------|------|------|
| RP-001 | 신고 생성 API (유저) | - | BE | **M** | 3 | TODO | targetType, reason, detail |
| RP-002 | 내 신고 내역 조회 | - | BE | **S** | 3 | TODO | 내 신고 목록 |
| RP-003 | 신고 사유 상세 분류 | - | BE | **S** | 4 | TODO | 스팸/부적절/허위/저작권/기타 |
| RP-004 | 신고 처리 단계 (4단계) | - | BE | **S** | 4 | TODO | 접수→검토→조치→완료 |
| RP-005 | 제재 상태 관리 스키마 | - | BE | **S** | 4 | TODO | 경고/일시정지/영구정지/해제 |
| RP-006 | 신고 이력 저장 | - | BE | **S** | 4 | TODO | 반복 신고 추적 |
| RP-007 | 제재 알림 발송 | - | BE | **S** | 4 | TODO | 제재 대상 알림 |

---

## 📌 MoSCoW 수량 요약

| 등급 | UseCase 수 | 비율 | Sprint |
|------|-----------|------|--------|
| **M** Must Have | ~48 | ~30% | Sprint 1~3 |
| **S** Should Have | ~62 | ~38% | Sprint 2~4 |
| **C** Could Have | ~46 | ~28% | Sprint 4~5 |
| **W** Won't Have | ~6 | ~4% | 향후 |
| **합계** | **~162** | 100% | |

---

## 📌 Sprint별 UseCase 수 예상

| Sprint | Must | Should | Could | 합계 |
|--------|------|--------|-------|------|
| Sprint 1 | ~22 | 0 | 0 | ~22 |
| Sprint 2 | ~15 | ~18 | 0 | ~33 |
| Sprint 3 | ~11 | ~25 | 0 | ~36 |
| Sprint 4 | 0 | ~19 | ~14 | ~33 |
| Sprint 5 | 0 | 0 | ~32 | ~32 |
| Sprint 6 (buffer) | 0 | 0 | 0 | 잔여 |

---

## 📌 사용법 (애자일 운영)

### 스프린트 시작 시
1. 해당 Sprint 열의 `TODO` 항목 확인
2. 팀원별 담당 배정 (담당 열 수정)
3. 상태를 `IN_PROGRESS`로 변경

### 스프린트 진행 중
- 완료 → `DONE`
- 코드 리뷰 중 → `REVIEW`
- 다음 스프린트로 이동 → Sprint 열 변경

### 스프린트 회고 시
- `DONE` 수 / 전체 수 = 완성률 계산
- 미완료 항목은 다음 Sprint로 이월
- MoSCoW 등급 재평가 (필요 시)

### 우선순위 변경 시
- MoSCoW 등급 변경 → Sprint 재배치
- Won't → Could/Should 격상 또는 그 반대

---

> 📌 **작성일:** 2026-04-02  
> 📌 **버전:** WBS v5 (MoSCoW 기반)  
> 📌 **기반 문서:** [VenueOn_최종_기능_페이지_정의서.md](./VenueOn_최종_기능_페이지_정의서.md)  
> 📌 **이전 WBS:** [VenueOn_WBS_Detailed_v2.csv](./VenueOn_WBS_Detailed_v2.csv)
