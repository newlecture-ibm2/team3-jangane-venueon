# 🔌 VenueOn 최종 API 스펙 v6

> **작성일:** 2026-04-10  
> **규칙:** 모든 백엔드 경로에 `/api` 미포함 (프론트엔드 BFF에서만 `/api/` 접두사 사용)  
> **인증:** JWT Bearer Token (`Authorization: Bearer {token}`)  
> **공통 응답:** `{ "status": "SUCCESS|ERROR", "data": {...}, "message": "..." }`  
> **설계 기반:** 티켓 중심 판매 + 세션 기반 상태 Computed

---

## 📌 상태 전이 규칙

### 이벤트 상태 (`Event.status`)

```
DRAFT → PUBLISHED → ONGOING → ENDED
  │         │
  │         └→ CANCELLED
  └→ (삭제)
```

| 전이 | 조건 |
|------|------|
| DRAFT → PUBLISHED | 호스트가 게시 버튼 클릭 |
| PUBLISHED → ONGOING | 세션 startTime 도래 (Computed) |
| ONGOING → ENDED | 모든 세션 endTime 경과 (Computed) or 호스트 수동 |
| PUBLISHED/ONGOING → CANCELLED | 호스트 취소 |

> ONGOING, ENDED는 DB에 직접 저장하지 않고 세션의 startTime/endTime 기반 조회 시 계산 (수동 ENDED 제외).

### 모집 상태 (`RecruitmentStatus` — Computed, DB 미저장)

```
세션별: 수동 마감 > 정원 초과 > 날짜 기반 > 기본(OPEN)
이벤트: 1개라도 OPEN → OPEN / 모두 PENDING → PENDING / 모두 CLOSED → CLOSED
```

### 주문 상태 (`Order.status`)

```
PENDING → PAID → REGISTERED → COMPLETED
  │         │
  └→ CANCELLED  └→ REFUND_REQUESTED → REFUNDED
```

### 신고 처리 단계 (`Report.status`)

```
RECEIVED → REVIEWING → ACTIONED → COMPLETED
                │
                └→ REJECTED
```

---

## 📌 1. User 모듈 (`/v1/auth`, `/v1/users`)

### 1-1. 인증 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 1 | `POST` | `/auth/signup` | ❌ | 이메일 회원가입 | `400` 유효성, `409` 이메일 중복 |
| 2 | `POST` | `/auth/signup/verify` | ❌ | 이메일 인증 코드 검증 | `400` 잘못된 코드, `410` 만료 |
| 3 | `POST` | `/auth/signup/resend` | ❌ | 인증 코드 재발송 | `404` 미등록, `429` 재발송 제한 |
| 4 | `POST` | `/auth/login` | ❌ | 로그인 → JWT 발급 | `401` 불일치, `403` 정지, `422` 미인증 |
| 5 | `POST` | `/auth/logout` | 🔑 ALL | 로그아웃 (Redis 블랙리스트) | — |
| 6 | `POST` | `/auth/refresh` | ❌ | Refresh → Access Token 재발급 | `401` 만료/무효 |
| 7 | `POST` | `/auth/forgot-password` | ❌ | 임시 비밀번호 이메일 발송 | `404` 미등록 |
| 8 | `GET` | `/auth/check-email?email=` | ❌ | 이메일 중복 확인 | — |
| 9 | `GET` | `/auth/oauth2/google` | ❌ | Google OAuth2 리다이렉트 | — |
| 10 | `GET` | `/auth/oauth2/google/callback` | ❌ | Google OAuth2 콜백 → JWT 발급 | `401` OAuth 실패 |

### 1-2. 호스트 인증 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 11 | `POST` | `/auth/host/signup` | ❌ | 호스트 회원가입 | `400`, `409` |
| 12 | `POST` | `/auth/host/signup/verify` | ❌ | 호스트 이메일 인증 | `400` |
| 13 | `POST` | `/auth/host/login` | ❌ | 호스트 로그인 | `401` |

### 1-3. 사용자 프로필 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 14 | `GET` | `/users/me` | 🔑 ALL | 내 프로필 조회 | — |
| 15 | `PUT` | `/users/me` | 🔑 ALL | 프로필 수정 | `400` |
| 16 | `PUT` | `/users/me/password` | 🔑 ALL | 비밀번호 변경 | `400` |
| 17 | `POST` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 업로드 | `400` |
| 18 | `DELETE` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 삭제 | — |
| 19 | `DELETE` | `/users/me` | 🔑 ALL | 회원 탈퇴 | `400` |

### 1-4. 관심 카테고리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 20 | `GET` | `/users/me/interest-categories` | 🔑 USER | 내 관심 카테고리 목록 | — |
| 21 | `PUT` | `/users/me/interest-categories` | 🔑 USER | 관심 카테고리 등록/수정 | `400` |

### 1-5. 사용자 공개 프로필 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 22 | `GET` | `/users/{userId}/profile` | ❌ | 공개 프로필 조회 | `404` |
| 23 | `GET` | `/users/{userId}/posts?page=&size=` | ❌ | 작성한 글 목록 | `404` |
| 24 | `GET` | `/users/{userId}/comments?page=&size=` | ❌ | 작성한 댓글 목록 | `404` |
| 25 | `GET` | `/users/{userId}/reviews?page=&size=` | ❌ | 작성한 리뷰 목록 | `404` |
| 26 | `GET` | `/users/{userId}/communities?page=&size=` | ❌ | 참여 커뮤니티 목록 | `404` |

---

## 📌 2. Event 모듈 (`/v1/events`)

### 2-1. 이벤트 목록/검색 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 27 | `GET` | `/events` | ❌ | 이벤트 목록 (필터 + 페이지네이션) | — |
| 28 | `GET` | `/events/recommended` | 🔑 USER | 관심 카테고리 기반 추천 | — |
| 29 | `GET` | `/events/popular` | ❌ | 인기 이벤트 | — |

#### 상세: `GET /events` 쿼리 파라미터

```
keyword, categoryId, type, regionSido, regionSigungu,
startDate, endDate, isOnline, minPrice, maxPrice,
recruitmentStatus, sort(latest|popular|price_asc|price_desc|rating),
page(default:0), size(default:12)
```

> `minPrice`, `maxPrice`는 해당 이벤트의 **최저가 티켓** 기준으로 필터링.

#### 응답 예시

```json
{
  "status": "SUCCESS",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Spring Boot 마스터 클래스",
        "thumbnailUrl": "/upload/event/1.jpg",
        "type": "CLASS",
        "status": "PUBLISHED",
        "recruitmentStatus": "OPEN",
        "startDate": "2026-05-01T10:00:00",
        "endDate": "2026-05-01T18:00:00",
        "minPrice": 30000,
        "maxPrice": 85000,
        "hasDiscount": true,
        "totalCapacity": 100,
        "totalAttendees": 45,
        "averageRating": 4.5,
        "reviewCount": 8,
        "creator": { "id": 2, "nickname": "테크캠프" }
      }
    ],
    "page": 0, "size": 12, "totalElements": 45, "totalPages": 4
  }
}
```

### 2-2. 이벤트 상세 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 30 | `GET` | `/events/{id}` | ❌ | 이벤트 상세 (세션 + 티켓 + 리뷰) | `404` |

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "title": "AI Summit 2026",
    "description": "<p>Rich Editor HTML</p>",
    "type": "CONFERENCE",
    "status": "ONGOING",
    "recruitmentStatus": "OPEN",
    "thumbnailUrl": "/upload/event/1.jpg",
    "hasSession": true,
    "startDate": "2026-05-01T10:00:00",
    "endDate": "2026-05-03T18:00:00",
    "recruitStartDate": "2026-04-01T00:00:00",
    "recruitEndDate": "2026-04-30T23:59:59",
    "category": { "id": 1, "name": "기술" },
    "creator": { "id": 2, "nickname": "테크캠프", "profileImg": "..." },
    "sessions": [
      {
        "id": 1, "title": "Day 1: 기초 강연",
        "description": "AI 기초",
        "sortOrder": 1,
        "startTime": "2026-05-01T10:00:00",
        "endTime": "2026-05-01T18:00:00",
        "location": "서울 강남구", "regionSido": "서울", "regionSigungu": "강남구",
        "isOnline": false, "onlineLink": null,
        "maxAttendees": 100, "currentAttendees": 45,
        "sessionStatus": "PUBLISHED",
        "recruitmentStatus": "OPEN",
        "recruitStartDate": "2026-04-01T00:00:00",
        "recruitEndDate": "2026-04-30T23:59:59"
      }
    ],
    "tickets": [
      {
        "id": 1, "name": "전체 패키지",
        "price": 85000, "originalPrice": 100000,
        "discountRate": 15,
        "isAllSessions": true,
        "maxQuantity": null, "soldCount": 12,
        "remainingQuantity": null,
        "isOnSale": true,
        "salesStart": null, "salesEnd": null,
        "sessions": ["Day 1", "Day 2", "Day 3"]
      },
      {
        "id": 2, "name": "Day 1 입장권",
        "price": 30000, "originalPrice": 30000,
        "discountRate": 0,
        "isAllSessions": false,
        "maxQuantity": 100, "soldCount": 45,
        "remainingQuantity": 55,
        "isOnSale": true,
        "sessions": ["Day 1"]
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 8,
    "ratingDistribution": { "1": 0, "2": 1, "3": 1, "4": 2, "5": 4 },
    "isWishlisted": false,
    "createdAt": "2026-04-01T09:00:00"
  }
}
```

### 2-3. 이벤트 CRUD API (호스트)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 31 | `POST` | `/events` | 🔑 HOST | 이벤트 생성 | `400` |
| 32 | `PUT` | `/events/{id}` | 🔑 HOST | 이벤트 수정 | `403`, `404` |
| 33 | `DELETE` | `/events/{id}` | 🔑 HOST | 이벤트 삭제 | `403`, `422` 수강생 존재 |
| 34 | `PATCH` | `/events/{id}/status` | 🔑 HOST | 상태 변경 (PUBLISHED/ENDED/CANCELLED) | `403`, `422` 잘못된 전이 |
| 35 | `POST` | `/events/{id}/thumbnail` | 🔑 HOST | 썸네일 업로드 | `400` |

#### 상세: `POST /events`

```json
{
  "title": "AI Summit 2026",
  "description": "<p>Rich Editor HTML</p>",
  "categoryId": 1,
  "type": "CONFERENCE",
  "hasSession": true,
  "sessions": [
    {
      "title": "Day 1: 기초 강연",
      "description": "AI 기초",
      "sortOrder": 1,
      "startTime": "2026-05-01T10:00:00",
      "endTime": "2026-05-01T18:00:00",
      "location": "서울 강남구",
      "regionSido": "서울", "regionSigungu": "강남구",
      "isOnline": false,
      "maxAttendees": 100,
      "recruitStartDate": "2026-04-01T00:00:00",
      "recruitEndDate": "2026-04-30T23:59:59"
    }
  ],
  "tickets": [
    {
      "name": "전체 패키지",
      "price": 85000, "originalPrice": 100000,
      "isAllSessions": true,
      "maxQuantity": null,
      "salesStart": null, "salesEnd": null
    }
  ],
  "status": "DRAFT"
}
```

### 2-4. 이벤트 세션 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 36 | `GET` | `/events/{eventId}/sessions` | ❌ | 세션 목록 | `404` |
| 37 | `POST` | `/events/{eventId}/sessions` | 🔑 HOST | 세션 추가 | `403` |
| 38 | `PUT` | `/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 수정 | `403`, `404` |
| 39 | `DELETE` | `/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 삭제 | `403`, `404` |
| 40 | `PATCH` | `/events/{eventId}/sessions/reorder` | 🔑 HOST | 세션 순서 변경 | `403` |

### 2-5. 이벤트 모집 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 41 | `PATCH` | `/host/events/{eventId}/sessions/{sessionId}/recruitment` | 🔑 HOST | 세션별 모집 마감/재개 | `403`, `404` |
| 42 | `PATCH` | `/host/events/{eventId}/recruitment` | 🔑 HOST | 이벤트 전체 모집 일괄 마감/재개 | `403`, `404` |

```json
// PATCH Request
{ "closed": true }
// closed: true → 즉시 마감, false → 마감 해제
```

### 2-6. 티켓 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 43 | `GET` | `/events/{eventId}/tickets` | ❌ | 이벤트 티켓 목록 | `404` |
| 44 | `POST` | `/host/events/{eventId}/tickets` | 🔑 HOST | 티켓 생성 | `403`, `400` |
| 45 | `PUT` | `/host/tickets/{ticketId}` | 🔑 HOST | 티켓 수정 | `403`, `404` |
| 46 | `DELETE` | `/host/tickets/{ticketId}` | 🔑 HOST | 티켓 삭제 | `403`, `422` 판매된 티켓 |

```json
// POST /host/events/{eventId}/tickets Request
{
  "name": "Day 1 입장권",
  "description": "AI 기초 강연 입장",
  "price": 30000,
  "originalPrice": 30000,
  "maxQuantity": 100,
  "isAllSessions": false,
  "sessionIds": [1],
  "sortOrder": 1,
  "salesStart": null,
  "salesEnd": null
}
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 2, "name": "Day 1 입장권", "price": 30000,
    "isAllSessions": false, "sessions": ["Day 1: 기초 강연"]
  }
}
```

### 2-7. 호스트 이벤트 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 47 | `GET` | `/host/events?status=&page=&size=` | 🔑 HOST | 내 이벤트 목록 | — |
| 48 | `GET` | `/host/events/drafts?page=&size=` | 🔑 HOST | 임시저장 목록 | — |
| 49 | `GET` | `/host/events/{id}/attendees?page=&size=` | 🔑 HOST | 수강생 목록 | `403` |

### 2-8. 리뷰 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 50 | `GET` | `/events/{eventId}/reviews?page=&size=` | ❌ | 리뷰 목록 | `404` |
| 51 | `POST` | `/events/{eventId}/reviews` | 🔑 USER | 리뷰 작성 (1인 1리뷰) | `403` 미수강, `409` 중복 |
| 52 | `PUT` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 리뷰 수정 | `403` |
| 53 | `DELETE` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 리뷰 삭제 | `403` |

### 2-9. 카테고리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 54 | `GET` | `/categories` | ❌ | 전체 카테고리 목록 | — |

---

## 📌 3. Community 모듈 (`/v1/communities`)

### 3-1. 커뮤니티 CRUD API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 55 | `GET` | `/communities?isPublic=&page=&size=` | ❌/🔑 | 커뮤니티 목록 | — |
| 56 | `GET` | `/communities/{id}` | 🔑 ALL | 커뮤니티 상세 | `403`, `404` |
| 57 | `POST` | `/communities` | 🔑 USER | 커뮤니티 생성 요청 (어드민 승인 필요) | `400` |
| 58 | `PUT` | `/communities/{id}` | 🔑 USER | 커뮤니티 수정 (관리자만) | `403` |
| 59 | `DELETE` | `/communities/{id}` | 🔑 ADMIN | 커뮤니티 삭제 | `404` |
| 60 | `GET` | `/communities/recommended` | 🔑 USER | 뱃지 기반 추천 커뮤니티 | — |
| 61 | `POST` | `/communities/{id}/bookmark` | 🔑 USER | 커뮤니티 북마크 토글 | `404` |

### 3-2. 커뮤니티 멤버 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 62 | `GET` | `/communities/{id}/members?role=&keyword=&page=&size=` | 🔑 ALL | 멤버 목록 | `403` |
| 63 | `POST` | `/communities/{id}/join` | 🔑 USER | 가입 | `403` 뱃지 미보유, `409` |
| 64 | `DELETE` | `/communities/{id}/leave` | 🔑 USER | 탈퇴 | `422` 관리자 탈퇴 불가 |
| 65 | `PATCH` | `/communities/{id}/members/{userId}/role` | 🔑 USER | 권한 변경 (관리자만) | `403` |

### 3-3. 게시글 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 66 | `GET` | `/communities/{id}/posts?type=&keyword=&page=&size=` | 🔑 ALL | 게시글 목록 | `403` |
| 67 | `GET` | `/communities/{id}/posts/popular?page=&size=` | 🔑 ALL | 인기글 | `403` |
| 68 | `GET` | `/communities/{id}/posts/pinned` | 🔑 ALL | 공지/고정 게시글 | `403` |
| 69 | `POST` | `/communities/{id}/posts` | 🔑 USER | 게시글 작성 | `403` READ_ONLY/BLOCKED |
| 70 | `GET` | `/communities/{id}/posts/{postId}` | 🔑 ALL | 게시글 상세 | `404` |
| 71 | `PUT` | `/communities/{id}/posts/{postId}` | 🔑 USER | 게시글 수정 | `403` |
| 72 | `DELETE` | `/communities/{id}/posts/{postId}` | 🔑 USER | 게시글 삭제 | `403` |
| 73 | `PATCH` | `/communities/{id}/posts/{postId}/pin` | 🔑 USER | 상단 고정 (관리자만) | `403` |
| 74 | `POST` | `/communities/{id}/posts/{postId}/like` | 🔑 USER | 좋아요 토글 | `403` |
| 75 | `POST` | `/communities/{id}/posts/{postId}/bookmark` | 🔑 USER | 북마크 토글 | `403` |

### 3-4. 댓글 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 76 | `GET` | `/posts/{postId}/comments` | 🔑 ALL | 댓글 목록 (트리) | `404` |
| 77 | `POST` | `/posts/{postId}/comments` | 🔑 USER | 댓글/대댓글 작성 | `403`, `404` |
| 78 | `PUT` | `/comments/{commentId}` | 🔑 USER | 댓글 수정 | `403` |
| 79 | `DELETE` | `/comments/{commentId}` | 🔑 USER | 댓글 삭제 | `403` |
| 80 | `POST` | `/comments/{commentId}/like` | 🔑 USER | 댓글 좋아요 토글 | — |

---

## 📌 4. Order 모듈 (`/v1/orders`) — 결제/환불

### 4-1. 주문/결제 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 81 | `POST` | `/orders` | 🔑 USER | 단건 주문 생성 (ticketId) | `404`, `409`, `422` 정원/모집 |
| 82 | `POST` | `/orders/checkout` | 🔑 USER | 장바구니 일괄 주문 | `400` |
| 83 | `POST` | `/orders/{id}/confirm` | 🔑 USER | 토스 결제 승인 | `400`, `402` |
| 84 | `POST` | `/orders/toss/webhook` | ❌ (서버) | 토스 Webhook 결제 검증 | — |
| 85 | `GET` | `/orders/{id}` | 🔑 USER | 주문 상세 | `403`, `404` |
| 86 | `GET` | `/orders/me?page=&size=` | 🔑 USER | 내 주문/결제 내역 | — |

#### 상세: `POST /orders`

```json
// Request — ticketId 기반
{ "ticketId": 1, "quantity": 1, "paymentMethod": "CARD" }
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "orderId": 100,
    "tossOrderId": "venueon_order_100_1680000000",
    "amount": 85000,
    "orderName": "AI Summit 2026 - 전체 패키지",
    "customerName": "홍길동",
    "customerEmail": "user@example.com",
    "tossClientKey": "test_ck_xxxxxxxx"
  }
}
```

> 주문 생성 시: 1) 티켓 판매 기간 확인, 2) 티켓 수량 확인, 3) **포함된 모든 세션 정원 확인**, 4) **모집 상태가 OPEN인지 확인**

### 4-2. 환불 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 87 | `POST` | `/orders/{orderId}/refund` | 🔑 USER | 환불 요청 | `404`, `422` |
| 88 | `GET` | `/users/me/refunds?page=&size=` | 🔑 USER | 내 환불 내역 | — |

### 4-3. 호스트 결제/환불 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 89 | `GET` | `/host/dashboard` | 🔑 HOST | 호스트 대시보드 요약 | — |
| 90 | `GET` | `/host/payments?eventId=&page=&size=` | 🔑 HOST | 내 이벤트 결제 내역 | — |
| 91 | `POST` | `/host/orders/{orderId}/refund` | 🔑 HOST | 호스트 직접 환불 | `403`, `422` |
| 92 | `GET` | `/host/refunds?page=&size=` | 🔑 HOST | 호스트 환불 이력 | — |

---

## 📌 5. Wishlist / Cart 모듈

### 5-1. 찜 목록 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 93 | `GET` | `/wishlist?page=&size=` | 🔑 USER | 찜 목록 | — |
| 94 | `POST` | `/wishlist` | 🔑 USER | 찜 추가 (eventId) | `404`, `409` |
| 95 | `DELETE` | `/wishlist/{eventId}` | 🔑 USER | 찜 해제 | `404` |
| 96 | `POST` | `/wishlist/{eventId}/to-cart` | 🔑 USER | 찜 → 장바구니 이동 | `409` |

### 5-2. 장바구니 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 97 | `GET` | `/cart` | 🔑 USER | 장바구니 목록 | — |
| 98 | `POST` | `/cart` | 🔑 USER | 장바구니 추가 (**ticketId**) | `404`, `409`, `422` |
| 99 | `PATCH` | `/cart/{cartId}` | 🔑 USER | 수량 변경 | `400` |
| 100 | `DELETE` | `/cart/{cartId}` | 🔑 USER | 항목 삭제 | `404` |
| 101 | `GET` | `/cart/summary` | 🔑 USER | 장바구니 요약 | — |

---

## 📌 6. Badge 모듈 (`/v1/badges`)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 102 | `GET` | `/badges/me?page=&size=` | 🔑 USER | 내 뱃지 목록 | — |
| 103 | `PATCH` | `/badges/{badgeId}/visibility` | 🔑 USER | 공개/비공개 토글 | `403`, `404` |
| 104 | `GET` | `/badges/search?badgeNames=&eventIds=&page=&size=` | 🔑 USER | 뱃지 보유자 검색 | — |
| 105 | `POST` | `/badges/invite` | 🔑 USER | 뱃지 보유자 커뮤니티 초대 | `403` |

---

## 📌 7. Notification 모듈 (`/v1/notifications`)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 106 | `GET` | `/notifications?page=&size=` | 🔑 ALL | 내 알림 목록 | — |
| 107 | `GET` | `/notifications/unread-count` | 🔑 ALL | 미확인 알림 수 | — |
| 108 | `PATCH` | `/notifications/{id}/read` | 🔑 ALL | 개별 읽음 | `403`, `404` |
| 109 | `PATCH` | `/notifications/read-all` | 🔑 ALL | 전체 읽음 | — |

> **알림 유형 (5종):** COMMENT, LECTURE, SANCTION, PAYMENT, REPORT

---

## 📌 8. Report 모듈 (`/v1/reports`)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 110 | `POST` | `/reports` | 🔑 ALL | 신고 접수 | `400`, `409` |
| 111 | `GET` | `/reports/me?page=&size=` | 🔑 ALL | 내 신고 이력 | — |
| 112 | `POST` | `/reports/{reportId}/objection` | 🔑 ALL | 이의 제기 | `404`, `422` |
| 113 | `GET` | `/reports/{reportId}/objection` | 🔑 ALL | 이의 제기 상태 | `404` |

---

## 📌 9. Admin 모듈 (`/v1/admin`)

### 9-1. 대시보드

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 114 | `GET` | `/admin/dashboard` | 🔑 ADMIN | 대시보드 요약 |

### 9-2. 회원 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 115 | `GET` | `/admin/users?role=&keyword=&page=&size=` | 🔑 ADMIN | 회원 목록 | — |
| 116 | `GET` | `/admin/users/{id}` | 🔑 ADMIN | 회원 상세 | `404` |
| 117 | `PATCH` | `/admin/users/{id}/role` | 🔑 ADMIN | 권한 변경 | `400` |
| 118 | `PATCH` | `/admin/users/{id}/suspend` | 🔑 ADMIN | 회원 정지 | `422` |
| 119 | `PATCH` | `/admin/users/{id}/unsuspend` | 🔑 ADMIN | 정지 해제 | `422` |
| 120 | `PATCH` | `/admin/users/{id}/warn` | 🔑 ADMIN | 경고 | — |
| 121 | `DELETE` | `/admin/users/{id}` | 🔑 ADMIN | 비활성화 | — |

### 9-3. 카테고리 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 122 | `GET` | `/admin/categories` | 🔑 ADMIN | 카테고리 목록 | — |
| 123 | `POST` | `/admin/categories` | 🔑 ADMIN | 생성 | `409` |
| 124 | `PUT` | `/admin/categories/{id}` | 🔑 ADMIN | 수정 | `404` |
| 125 | `DELETE` | `/admin/categories/{id}` | 🔑 ADMIN | 삭제 | `422` |
| 126 | `PATCH` | `/admin/categories/reorder` | 🔑 ADMIN | 순서 변경 | — |

### 9-4. 관심 카테고리 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 127 | `GET` | `/admin/interest-categories` | 🔑 ADMIN | 목록 | — |
| 128 | `POST` | `/admin/interest-categories` | 🔑 ADMIN | 추가 | `409` |
| 129 | `PUT` | `/admin/interest-categories/{id}` | 🔑 ADMIN | 수정 | `404` |
| 130 | `DELETE` | `/admin/interest-categories/{id}` | 🔑 ADMIN | 삭제 | `422` |
| 131 | `GET` | `/admin/interest-categories/stats` | 🔑 ADMIN | 등록 통계 | — |

### 9-5. 신고 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 132 | `GET` | `/admin/reports?targetType=&status=&page=&size=` | 🔑 ADMIN | 신고 목록 | — |
| 133 | `GET` | `/admin/reports/{id}` | 🔑 ADMIN | 신고 상세 | `404` |
| 134 | `PATCH` | `/admin/reports/{id}/status` | 🔑 ADMIN | 처리 단계 변경 | `422` |
| 135 | `PATCH` | `/admin/reports/{id}/action` | 🔑 ADMIN | 조치 | — |
| 136 | `GET` | `/admin/reports/history?userId=&page=&size=` | 🔑 ADMIN | 유저 신고 이력 | `404` |

### 9-6. 커뮤니티 개설 요청 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 137 | `GET` | `/admin/community-requests?page=&size=` | 🔑 ADMIN | 요청 목록 | — |
| 138 | `PATCH` | `/admin/community-requests/{id}/approve` | 🔑 ADMIN | 승인 | `404`, `422` |
| 139 | `PATCH` | `/admin/community-requests/{id}/reject` | 🔑 ADMIN | 거절 | `404`, `422` |

### 9-7. 호스트 요청 처리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 140 | `GET` | `/admin/requests?category=&status=&page=&size=` | 🔑 ADMIN | 요청 목록 | — |
| 141 | `PATCH` | `/admin/requests/{id}/approve` | 🔑 ADMIN | 승인 | `404`, `422` |
| 142 | `PATCH` | `/admin/requests/{id}/reject` | 🔑 ADMIN | 거절 | `404`, `422` |

### 9-8. 리뷰 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 143 | `GET` | `/admin/reviews?page=&size=` | 🔑 ADMIN | 리뷰 목록 | — |
| 144 | `PATCH` | `/admin/reviews/{id}/hide` | 🔑 ADMIN | 숨김 | `404` |
| 145 | `DELETE` | `/admin/reviews/{id}` | 🔑 ADMIN | 삭제 | `404` |

### 9-9. 환불 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 146 | `GET` | `/admin/refunds?status=&page=&size=` | 🔑 ADMIN | 환불 목록 | — |
| 147 | `PATCH` | `/admin/refunds/{id}/approve` | 🔑 ADMIN | 승인 | `404`, `422` |
| 148 | `PATCH` | `/admin/refunds/{id}/reject` | 🔑 ADMIN | 거절 | `404`, `422` |

### 9-10. 커뮤니티 제재 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 149 | `GET` | `/admin/communities?page=&size=` | 🔑 ADMIN | 커뮤니티 + 제재 현황 | — |
| 150 | `GET` | `/admin/communities/{id}/sanctions?page=&size=` | 🔑 ADMIN | 제재 사용자 목록 | `404` |
| 151 | `PATCH` | `/admin/communities/{id}/members/{userId}/sanction` | 🔑 ADMIN | 제재 변경 | `404` |

### 9-11. 이벤트 관리

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 152 | `GET` | `/admin/events?page=&size=` | 🔑 ADMIN | 이벤트 목록 | — |
| 153 | `PATCH` | `/admin/events/{id}/hide` | 🔑 ADMIN | 숨김 | `404` |
| 154 | `DELETE` | `/admin/events/{id}` | 🔑 ADMIN | 삭제 | `404` |

---

## 📌 10. Notice 모듈 (`/v1/notices`, `/v1/requests`)

### 10-1. 공지사항

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 155 | `GET` | `/notices?type=&targetRole=&page=&size=` | ❌ | 공지 목록 | — |
| 156 | `GET` | `/notices/{id}` | ❌ | 공지 상세 | `404` |
| 157 | `POST` | `/notices` | 🔑 ADMIN | 공지 작성 | `400` |
| 158 | `PUT` | `/notices/{id}` | 🔑 ADMIN | 공지 수정 | `404` |
| 159 | `DELETE` | `/notices/{id}` | 🔑 ADMIN | 공지 삭제 | `404` |
| 160 | `PATCH` | `/notices/{id}/pin` | 🔑 ADMIN | 고정/해제 | `404` |

### 10-2. 호스트 요청 게시판

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 161 | `GET` | `/host/requests?category=&status=&page=&size=` | 🔑 HOST | 내 요청 목록 | — |
| 162 | `POST` | `/host/requests` | 🔑 HOST | 요청 작성 | `400` |
| 163 | `GET` | `/host/requests/{id}` | 🔑 HOST | 요청 상세 | `403`, `404` |

### 10-3. 커뮤니티 관리자 요청

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 164 | `GET` | `/communities/{id}/requests?page=&size=` | 🔑 USER | 요청 목록 (관리자만) | `403` |
| 165 | `PATCH` | `/communities/{id}/requests/{reqId}/approve` | 🔑 USER | 승인 | `403`, `422` |
| 166 | `PATCH` | `/communities/{id}/requests/{reqId}/reject` | 🔑 USER | 거절 | `403`, `422` |

---

## 📌 11. 마이페이지 통합 API (`/v1/mypage`)

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 167 | `GET` | `/mypage/summary` | 🔑 USER | 대시보드 요약 |
| 168 | `GET` | `/mypage/events?tab=ongoing&page=&size=` | 🔑 USER | 수강 중 |
| 169 | `GET` | `/mypage/events?tab=completed&page=&size=` | 🔑 USER | 수강 완료 |
| 170 | `GET` | `/mypage/communities?tab=joined&page=&size=` | 🔑 USER | 참여 커뮤니티 |
| 171 | `GET` | `/mypage/communities?tab=bookmarked&page=&size=` | 🔑 USER | 북마크 커뮤니티 |
| 172 | `GET` | `/mypage/communities?tab=my-posts&page=&size=` | 🔑 USER | 내 게시물 |
| 173 | `GET` | `/mypage/communities?tab=bookmarked-posts&page=&size=` | 🔑 USER | 북마크 게시물 |

---

## 📌 12. 파일 업로드 API (`/v1/upload`)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 174 | `POST` | `/upload/image` | 🔑 ALL | 이미지 업로드 | `400` |

---

## 📌 전체 API 요약

| 모듈 | # 범위 | API 수 | 주요 기능 |
|------|--------|--------|----------|
| **User** (인증/프로필) | #1~26 | 26개 | 회원가입, 로그인, OAuth2, 프로필, 공개 프로필 |
| **Event** (이벤트/세션/티켓) | #27~54 | 28개 | CRUD, 필터, 세션, **티켓 CRUD**, 리뷰, **모집 관리** |
| **Community** (커뮤니티) | #55~80 | 26개 | 커뮤니티 CRUD, 북마크, 멤버, 게시글, 댓글 |
| **Order** (결제) | #81~92 | 12개 | **ticketId 기반 주문**, 토스, 환불, 호스트 대시보드 |
| **Wishlist/Cart** | #93~101 | 9개 | 찜, **티켓 기반 장바구니** |
| **Badge** (뱃지) | #102~105 | 4개 | 뱃지 조회, 검색/초대 |
| **Notification** (알림) | #106~109 | 4개 | 알림 5종, 읽음 |
| **Report** (신고) | #110~113 | 4개 | 신고, 이의 제기 |
| **Admin** (관리자) | #114~154 | 41개 | 전체 관리 |
| **Notice** (공지) | #155~166 | 12개 | 공지, 요청 게시판 |
| **Mypage** | #167~173 | 7개 | 탭별 통합 조회 |
| **Upload** | #174 | 1개 | 이미지 업로드 |
| **합계** | | **174개** | |

---

## 📌 공통 에러 코드

| HTTP | Code | 설명 |
|------|------|------|
| `400` | `BAD_REQUEST` | 유효성 검증 실패 |
| `401` | `UNAUTHORIZED` | 인증 실패 (JWT 없음/만료) |
| `402` | `PAYMENT_FAILED` | 토스 결제 실패 |
| `403` | `FORBIDDEN` | 권한 없음 |
| `404` | `NOT_FOUND` | 리소스 없음 |
| `409` | `CONFLICT` | 중복 (이메일, 리뷰, 찜 등) |
| `410` | `GONE` | 만료 (인증 코드) |
| `422` | `UNPROCESSABLE` | 비즈니스 규칙 위반 (정원 초과, 모집 마감, 잘못된 상태 전이 등) |
| `429` | `TOO_MANY_REQUESTS` | 요청 제한 초과 |
| `500` | `INTERNAL_ERROR` | 서버 오류 |

```json
// 공통 에러 응답
{
  "status": "ERROR",
  "code": "UNPROCESSABLE",
  "message": "해당 세션은 현재 모집중이 아닙니다.",
  "timestamp": "2026-04-15T14:30:00"
}
```
