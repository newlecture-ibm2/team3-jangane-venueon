# VenueOn MVP API 엔드포인트 스펙 (v4)

> **규칙:** 모든 경로에 `/api` 미포함  
> **인증:** JWT Bearer Token (Header: `Authorization: Bearer {token}`)  
> **역할:** Admin · Host · User  
> **변경 이력:** v3(40개) → v4(66개) — Figma 화면 설계서 기반 신고/환불/Admin 확장  
> **참고:** [MVP_아키텍처_v4.md](./MVP_아키텍처_v4.md)

---

## 1. 인증 (Auth) — 4 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/auth/signup` | 회원가입 | 누구나 | `{ email, password, nickname, role(ADMIN/HOST/USER) }` | `{ userId, email, role }` |
| POST | `/auth/login` | 로그인 → JWT 발급 | 누구나 | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | 토큰 갱신 | 인증된 사용자 | `{ refreshToken }` | `{ accessToken }` |
| POST | `/auth/logout` | 로그아웃 | 인증된 사용자 | - | `{ message }` |

---

## 2. 마이페이지 (MyPage) — 7 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response | v4 |
|--------|----------|------|------|-------------|----------|-----|
| GET | `/mypage/profile` | 내 프로필 조회 | 인증된 사용자 | - | `{ userId, email, nickname, role, profileImg, createdAt }` | |
| PUT | `/mypage/profile` | 내 프로필 수정 | 인증된 사용자 | `{ nickname, profileImg }` | `{ userId, nickname, profileImg }` | |
| GET | `/mypage/orders` | 내 구매/예약 내역 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [...] }` | |
| GET | `/mypage/communities` | 내 커뮤니티 목록 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [...] }` | |
| GET | `/mypage/events` | 내 참여 이벤트 목록 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [...] }` | |
| 🆕 PUT | `/mypage/profile/image` | 프로필 사진 변경 | 인증된 사용자 | `multipart/form-data: file` | `{ profileImg }` | **신규** |
| 🆕 DELETE | `/mypage/profile/image` | 프로필 사진 삭제 (기본으로 복원) | 인증된 사용자 | - | `{ profileImg: null }` | **신규** |

---

## 3. 이벤트 (Events) — 공개 조회 — 2 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/events` | 이벤트 목록 (검색/필터/페이징) | 누구나 | Query: `?keyword=&category=&type=&isFree=&page=&size=` | `{ content: [...], totalPages, totalElements }` |
| GET | `/events/{id}` | 이벤트 상세 | 누구나 | - | `{ eventId, title, description, category, type, location, isOnline, price, maxAttendees, currentAttendees, thumbnailUrl, startDate, endDate, host, status }` |

> **v4 변경:** 조회 시 `is_hidden=false`인 이벤트만 반환 (관리자 API는 숨김 포함)

---

## 4. 참가 신청 / 더미 결제 (Orders) — 4 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response | v4 |
|--------|----------|------|------|-------------|----------|-----|
| POST | `/orders` | 이벤트 참가 신청 | User | `{ eventId, quantity, paymentMethod }` | `{ orderId, eventId, status, quantity, amount, paymentMethod, orderedAt }` | **필드 추가** |
| GET | `/orders/{id}` | 주문 상세 | 인증된 사용자 (본인) | - | `{ orderId, event, status, quantity, amount, paymentMethod, orderedAt }` | **필드 추가** |
| POST | `/orders/{id}/cancel` | 참가 취소 | 인증된 사용자 (본인) | - | `{ orderId, status: CANCELLED }` | |
| 🆕 POST | `/orders/{id}/refund` | 환불 요청 | 인증된 사용자 (본인) | `{ reason }` | `{ refundId, orderId, amount, status: PENDING }` | **신규** |

> **MVP 더미 결제:** `POST /orders` 호출 시 실제 PG 연동 없이 처리.  
> 유료 이벤트 → 즉시 `PAID` / 무료 이벤트 → 즉시 `REGISTERED`  
> **v4 추가:** `quantity` (인원 수, 기본 1), `paymentMethod` (CARD / KAKAO_PAY / NAVER_PAY / BANK_TRANSFER)  
> **금액 계산:** `amount = event.price × quantity`

---

## 5. 커뮤니티 (Communities) — 8 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/communities` | 커뮤니티 생성 (이벤트 연동) | 인증된 사용자 | `{ eventId, name, description, thumbnailUrl, isPublic }` | `{ communityId, name }` |
| GET | `/communities` | 커뮤니티 목록 | 누구나 | Query: `?page=&size=` | `{ content: [...] }` |
| GET | `/communities/{id}` | 커뮤니티 상세 | 누구나 | - | `{ communityId, name, description, memberCount, ... }` |
| PUT | `/communities/{id}` | 커뮤니티 수정 | 작성자 본인 | `{ name, description, ... }` | `{ communityId, ... }` |
| DELETE | `/communities/{id}` | 커뮤니티 삭제 | 작성자 본인 | - | `{ message }` |
| POST | `/communities/{id}/join` | 커뮤니티 가입 | 인증된 사용자 | - | `{ memberId, role: MEMBER }` |
| DELETE | `/communities/{id}/leave` | 커뮤니티 탈퇴 | 인증된 사용자 | - | `{ message }` |
| GET | `/communities/{id}/members` | 멤버 목록 | 인증된 사용자 | - | `[ { userId, nickname, role, joinedAt } ]` |

---

## 6. 게시글 (Posts) — 5 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/communities/{communityId}/posts` | 게시글 작성 | 인증된 사용자 | `{ title, content, type(GENERAL/REVIEW/QUESTION/NOTICE) }` | `{ postId, title, type }` |
| GET | `/communities/{communityId}/posts` | 게시글 목록 | 누구나 | Query: `?type=&page=&size=` | `{ content: [...] }` |
| GET | `/posts/{id}` | 게시글 상세 | 누구나 | - | `{ postId, title, content, author, viewCount, commentCount, createdAt }` |
| PUT | `/posts/{id}` | 게시글 수정 | 작성자 본인 | `{ title, content }` | `{ postId, title, content }` |
| DELETE | `/posts/{id}` | 게시글 삭제 | 작성자 본인 | - | `{ message }` |

> **v4 변경:** 조회 시 `is_hidden=false`인 게시글만 반환

---

## 7. 댓글 (Comments) — 3 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/posts/{postId}/comments` | 댓글 작성 (대댓글 지원) | 인증된 사용자 | `{ content, parentId(선택) }` | `{ commentId, content, authorId }` |
| GET | `/posts/{postId}/comments` | 댓글 목록 | 누구나 | - | `[ { commentId, content, author, parentId, createdAt } ]` |
| DELETE | `/comments/{id}` | 댓글 삭제 | 작성자 본인 | - | `{ message }` |

> **v4 변경:** 조회 시 `is_hidden=false`인 댓글만 반환

---

## 🆕 8. 신고 (Reports) — 3 APIs

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 POST | `/reports` | 신고 생성 | 인증된 사용자 | `{ targetType(EVENT/POST/COMMENT/USER), targetId, reason, detail(max 300) }` | `{ reportId, targetType, targetId, status: PENDING }` |
| 🆕 GET | `/reports/mine` | 내 신고 내역 조회 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [ { reportId, targetType, targetId, reason, status, createdAt } ] }` |
| 🆕 GET | `/reports/{id}` | 신고 상세 조회 | 인증된 사용자 (본인) | - | `{ reportId, targetType, targetId, reason, detail, status, adminAction, createdAt, resolvedAt }` |

> **신고 사유 예시:** 스팸/광고, 부적절한 콘텐츠, 허위 정보, 저작권 침해, 기타  
> **상세 내용:** 최대 300자, 신고 사유에 대한 부가 설명

---

## 9. Host — 기업 회원 전용 — 9 APIs

> **참고:** `/host` (호스트 센터) = 프론트엔드 호스트 전용 랜딩 페이지 (서비스 소개 + 가입 유도)  
> 로그인한 기업 회원(Host)은 아래 `/host/*` API를 사용합니다.

### 대시보드 · 프로필

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/host` | Host 대시보드 (요약 정보) | Host | - | `{ totalEvents, totalTicketsSold, totalRevenue, recentOrders[] }` |
| GET | `/host/profile` | Host 기업 프로필 조회 | Host | - | `{ hostId, companyName, description, logoUrl, contactEmail, contactPhone, socialLinks }` |
| PUT | `/host/profile` | Host 기업 프로필 수정 | Host | `{ companyName, description, logoUrl, contactEmail, contactPhone, socialLinks }` | `{ hostId, companyName, ... }` |

### 이벤트 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/host/events` | 내가 주최한 이벤트 목록 | Host | Query: `?status=&page=&size=` | `{ content: [...], totalPages }` |
| POST | `/host/events` | 이벤트 생성 | Host | `{ title, description, categoryId, type, location, isOnline, price, maxAttendees, thumbnailUrl, startDate, endDate }` | `{ eventId, title, status: DRAFT }` |
| PUT | `/host/events/{id}` | 이벤트 수정 | Host (본인) | `{ title, description, ... }` | `{ eventId, title, ... }` |
| DELETE | `/host/events/{id}` | 이벤트 삭제 | Host (본인) | - | `{ message }` |
| PATCH | `/host/events/{id}/status` | 상태 변경 (DRAFT→PUBLISHED) | Host (본인) | `{ status }` | `{ eventId, status }` |

### 🆕 수강생 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 GET | `/host/events/{id}/attendees` | 수강생 목록 조회 | Host (본인 이벤트) | Query: `?page=&size=` | `{ content: [ { userId, nickname, orderedAt, amount, status, orderNumber } ] }` |

---

## 🆕 10. Admin — 관리자 — 20 APIs

### 10-1. 대시보드

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 GET | `/admin/dashboard` | 대시보드 요약 | Admin | - | `{ totalUsers, totalEvents, pendingReports, pendingRefunds }` |
| 🆕 GET | `/admin/dashboard/urgent` | 긴급 처리 항목 | Admin | - | `{ urgentRefunds: [...], urgentReports: [...] }` |

### 10-2. 사용자 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/admin/users` | 전체 회원 리스트 | Admin | Query: `?keyword=&role=&page=&size=` | `{ content: [ { userId, email, nickname, role, isActive, createdAt } ] }` |
| 🆕 GET | `/admin/users/hosts` | 주최자(HOST) 목록 | Admin | Query: `?keyword=&page=&size=` | `{ content: [ { userId, email, nickname, companyName, createdAt } ] }` |
| 🆕 GET | `/admin/users/students` | 수강생(USER) 목록 | Admin | Query: `?keyword=&page=&size=` | `{ content: [ { userId, email, nickname, createdAt } ] }` |
| 🆕 GET | `/admin/users/{id}` | 회원 상세 프로필 | Admin | - | `{ userId, email, nickname, role, profileImg, isActive, createdAt, eventCount, orderCount }` |
| 🆕 DELETE | `/admin/users/{id}` | 회원 삭제 (비활성화) | Admin | - | `{ userId, isActive: false }` |
| 🆕 POST | `/admin/users/{id}/warn` | 회원 경고 | Admin | `{ reason }` | `{ userId, message }` |

### 10-3. 강의 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 GET | `/admin/events` | 전체 강의 리스트 (숨김 포함) | Admin | Query: `?keyword=&status=&isHidden=&page=&size=` | `{ content: [...], totalPages }` |
| 🆕 GET | `/admin/events/{id}` | 강의 상세 (관리자 뷰) | Admin | - | `{ eventId, title, description, host, status, isHidden, attendeeCount, orderCount, ... }` |
| 🆕 PATCH | `/admin/events/{id}/hide` | 강의 숨김/공개 토글 | Admin | `{ isHidden: true/false }` | `{ eventId, isHidden }` |
| 🆕 DELETE | `/admin/events/{id}` | 강의 강제 삭제 | Admin | - | `{ message }` |

### 10-4. 신고 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 GET | `/admin/reports` | 신고 목록 | Admin | Query: `?targetType=&status=&page=&size=` | `{ content: [ { reportId, reporter, targetType, targetId, reason, status, createdAt } ] }` |
| 🆕 GET | `/admin/reports/{id}` | 신고 상세 | Admin | - | `{ reportId, reporter, targetType, targetId, targetContent, reason, detail, status, adminAction, createdAt }` |
| 🆕 POST | `/admin/reports/{id}/resolve` | 신고 처리 | Admin | `{ action(DELETE/HIDE/WARN/DISMISS) }` | `{ reportId, status, adminAction, resolvedAt }` |

> **action 별 처리:**  
> `DELETE` → 대상 영구 삭제, 신고 상태 RESOLVED  
> `HIDE` → 대상 `is_hidden=true`, 신고 상태 RESOLVED  
> `WARN` → 대상 사용자에게 경고, 신고 상태 RESOLVED  
> `DISMISS` → 반려, 신고 상태 REJECTED

### 10-5. 환불 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 GET | `/admin/refunds` | 환불 목록 (긴급건 우선) | Admin | Query: `?status=&page=&size=` | `{ content: [ { refundId, user, order, amount, status, requestedAt } ] }` |
| 🆕 POST | `/admin/refunds/{id}/approve` | 환불 승인 | Admin | - | `{ refundId, status: APPROVED, processedAt }` |
| 🆕 POST | `/admin/refunds/{id}/reject` | 환불 거절 | Admin | `{ reason }` | `{ refundId, status: REJECTED, processedAt }` |

> **환불 승인 시:** Refund → APPROVED, Order → REFUNDED  
> **환불 거절 시:** Refund → REJECTED

### 10-6. 콘텐츠 관리

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| 🆕 PATCH | `/admin/posts/{id}/hide` | 게시글 숨김/공개 토글 | Admin | `{ isHidden: true/false }` | `{ postId, isHidden }` |
| 🆕 PATCH | `/admin/comments/{id}/hide` | 댓글 숨김/공개 토글 | Admin | `{ isHidden: true/false }` | `{ commentId, isHidden }` |

---

## 11. 이미지 업로드 (Upload) — 1 API

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/upload/image` | 이미지 업로드 | 인증된 사용자 | `multipart/form-data: file` | `{ imageUrl, originalName, fileSize }` |

> **저장 경로:** 외부 볼륨 `dist/upload`  
> **정적 이미지:** `frontend/public` 폴더에서 관리

---

## 페이지 경로 vs API 경로 구분

| 경로 | 종류 | 설명 |
|------|------|------|
| `/` | **프론트 페이지** | 메인 홈 (이벤트 목록/검색) |
| `/auth/*` | **프론트 페이지** | 수강생 로그인/회원가입 |
| `/events/*` | **프론트 페이지** | 이벤트 목록/상세/생성 |
| `/community/*` | **프론트 페이지** | 스터디룸(커뮤니티) |
| `/mypage/*` | **프론트 페이지** | 마이페이지 + 프로필 설정 |
| `/host` | **프론트 페이지** | 🆕 호스트 센터 랜딩 (서비스 소개) |
| `/host/*` | **백엔드 API** | 로그인한 기업 회원(Host)이 사용하는 API |
| `/admin/login` | **프론트 페이지** | 🆕 관리자 로그인 페이지 |
| `/admin/*` | **백엔드 API** | 관리자(Admin)가 사용하는 API |

---

## API 총 정리 (v4)

| 도메인 | API 수 | v3 | 변화 | 비고 |
|--------|--------|-----|------|------|
| 인증 (Auth) | 4 | 4 | - | 가입·로그인·갱신·로그아웃 |
| 마이페이지 (MyPage) | **7** | 5 | **+2** | 🆕 프로필 사진 변경/삭제 |
| 이벤트 (Events) | 2 | 2 | - | 공개 목록·상세 조회 |
| 참가 신청 (Orders) | **4** | 3 | **+1** | 🆕 환불 요청 |
| 커뮤니티 (Communities) | 8 | 8 | - | CRUD + 가입·탈퇴·멤버 |
| 게시글 (Posts) | 5 | 5 | - | CRUD |
| 댓글 (Comments) | 3 | 3 | - | 작성·목록·삭제 |
| 🆕 신고 (Reports) | **3** | 0 | **+3** | 신고 생성·내역·상세 |
| Host (기업 회원) | **9** | 8 | **+1** | 🆕 수강생 목록 |
| 이미지 업로드 (Upload) | 1 | 1 | - | 파일 업로드 |
| Admin (관리자) | **20** | 1 | **+19** | 🆕 대시보드·사용자·강의·신고·환불·콘텐츠 |
| **합계** | **66** | **40** | **+26** | |

---

> 📌 **v4 변경일:** 2026-04-01  
> 📌 **이전 버전:** [VenueOn_MVP_API_스펙.md](./VenueOn_MVP_API_스펙.md) (v3, 40개)  
> 📌 **Figma 원본:** [VenueOn 기능별 수정](https://www.figma.com/design/OK0hiqZrWNSpOQn8XpdyAp/VenueOn?node-id=97-18)
