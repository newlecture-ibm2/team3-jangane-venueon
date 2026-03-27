# VenueOn MVP API 엔드포인트 스펙

> **규칙:** 모든 경로에 `/api` 미포함  
> **인증:** JWT Bearer Token (Header: `Authorization: Bearer {token}`)  
> **역할:** Admin · Host · User  
> **MVP 접근권한:** 설정 X — 누구나 접근 가능 (추후 권한 적용)

---

## 1. 인증 (Auth)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/auth/signup` | 회원가입 | 누구나 | `{ email, password, nickname, role(ADMIN/HOST/USER) }` | `{ userId, email, role }` |
| POST | `/auth/login` | 로그인 → JWT 발급 | 누구나 | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | 토큰 갱신 | 인증된 사용자 | `{ refreshToken }` | `{ accessToken }` |
| POST | `/auth/logout` | 로그아웃 | 인증된 사용자 | - | `{ message }` |

---

## 2. 마이페이지 (MyPage)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/mypage/profile` | 내 프로필 조회 | 인증된 사용자 | - | `{ userId, email, nickname, role, profileImg, createdAt }` |
| PUT | `/mypage/profile` | 내 프로필 수정 | 인증된 사용자 | `{ nickname, profileImg }` | `{ userId, nickname, profileImg }` |
| GET | `/mypage/orders` | 내 구매/예약 내역 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [...] }` |
| GET | `/mypage/communities` | 내 커뮤니티 목록 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [...] }` |
| GET | `/mypage/events` | 내 참여 이벤트 목록 | 인증된 사용자 | Query: `?page=&size=` | `{ content: [...] }` |

---

## 3. 이벤트 (Events) — 공개 조회

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/events` | 이벤트 목록 (검색/필터/페이징) | 누구나 | Query: `?keyword=&category=&type=&isFree=&page=&size=` | `{ content: [...], totalPages, totalElements }` |
| GET | `/events/{id}` | 이벤트 상세 | 누구나 | - | `{ eventId, title, description, category, type, location, isOnline, isFree, price, maxAttendees, currentAttendees, thumbnailUrl, startDate, endDate, host, status }` |

---

## 4. 참가 신청 / 더미 결제 (Orders)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/orders` | 이벤트 참가 신청 (유료: 더미 결제 → PAID / 무료: 즉시 등록) | User | `{ eventId }` | `{ orderId, eventId, status, amount, orderedAt }` |
| GET | `/orders/{id}` | 주문 상세 | 인증된 사용자 (본인) | - | `{ orderId, event, status, amount, orderedAt }` |
| POST | `/orders/{id}/cancel` | 참가 취소 | 인증된 사용자 (본인) | - | `{ orderId, status: CANCELLED }` |

> **MVP 더미 결제:** `POST /orders` 호출 시 실제 PG 연동 없이 처리.  
> 유료 이벤트 → 즉시 `PAID` / 무료 이벤트 → 즉시 `REGISTERED`

---

## 6. 커뮤니티 (Communities)

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

## 7. 게시글 (Posts)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/communities/{communityId}/posts` | 게시글 작성 | 인증된 사용자 | `{ title, content, type(GENERAL/REVIEW/QUESTION/NOTICE) }` | `{ postId, title, type }` |
| GET | `/communities/{communityId}/posts` | 게시글 목록 | 누구나 | Query: `?type=&page=&size=` | `{ content: [...] }` |
| GET | `/posts/{id}` | 게시글 상세 | 누구나 | - | `{ postId, title, content, author, viewCount, likeCount, commentCount, createdAt }` |
| PUT | `/posts/{id}` | 게시글 수정 | 작성자 본인 | `{ title, content }` | `{ postId, title, content }` |
| DELETE | `/posts/{id}` | 게시글 삭제 | 작성자 본인 | - | `{ message }` |

---

## 8. 댓글 (Comments)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/posts/{postId}/comments` | 댓글 작성 (대댓글 지원) | 인증된 사용자 | `{ content, parentId(선택) }` | `{ commentId, content, authorId }` |
| GET | `/posts/{postId}/comments` | 댓글 목록 | 누구나 | - | `[ { commentId, content, author, parentId, createdAt } ]` |
| DELETE | `/comments/{id}` | 댓글 삭제 | 작성자 본인 | - | `{ message }` |

---

## 9. Host — 기업 회원 전용 (Host)

> **참고:** `/organizations` = 프론트엔드 About 페이지 경로 (기업에게 플랫폼을 소개하는 정적 페이지, **API 없음**)  
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
| POST | `/host/events` | 이벤트 생성 | Host | `{ title, description, category, type, location, isOnline, isFree, maxAttendees, thumbnailUrl, startDate, endDate }` | `{ eventId, title, status: DRAFT }` |
| PUT | `/host/events/{id}` | 이벤트 수정 | Host (본인) | `{ title, description, ... }` | `{ eventId, title, ... }` |
| DELETE | `/host/events/{id}` | 이벤트 삭제 | Host (본인) | - | `{ message }` |
| PATCH | `/host/events/{id}/status` | 상태 변경 (DRAFT→PUBLISHED) | Host (본인) | `{ status }` | `{ eventId, status }` |

---

## 10. 이미지 업로드 (Upload)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| POST | `/upload/image` | 이미지 업로드 | 인증된 사용자 | `multipart/form-data: file` | `{ imageUrl, originalName, fileSize }` |

> **저장 경로:** 외부 볼륨 `dist/upload`  
> **정적 이미지:** `frontend/public` 폴더에서 관리

---

## 11. Admin (관리자)

| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|-------------|----------|
| GET | `/admin/users` | 전체 회원 리스트 조회 | Admin | Query: `?keyword=&role=&page=&size=` | `{ content: [ { userId, email, nickname, role, createdAt } ] }` |

---

## 페이지 경로 vs API 경로 구분

| 경로 | 종류 | 설명 |
|------|------|------|
| `/organizations` | **프론트 페이지** | 기업 대상 About 소개 페이지 (API 없음) |
| `/host/*` | **백엔드 API** | 로그인한 기업 회원(Host)이 사용하는 API |
| `/admin/*` | **백엔드 API** | 관리자(Admin)가 사용하는 API |

---

## API 총 정리

| 도메인 | API 수 | 비고 |
|--------|--------|------|
| 인증 (Auth) | 4 | 가입·로그인·갱신·로그아웃 |
| 마이페이지 (MyPage) | 5 | 프로필·구매내역·커뮤니티·이벤트 |
| 이벤트 (Events) | 2 | 공개 목록·상세 조회 |
| 참가 신청 (Orders) | 3 | 신청 + 상세 + 취소 |
| 커뮤니티 (Communities) | 8 | CRUD + 가입·탈퇴·멤버 |
| 게시글 (Posts) | 5 | CRUD |
| 댓글 (Comments) | 3 | 작성·목록·삭제 |
| Host (기업 회원) | 8 | 대시보드·프로필·이벤트 CRUD |
| 이미지 업로드 (Upload) | 1 | 파일 업로드 |
| Admin | 1 | 회원 관리 |
| **합계** | **40** | |
