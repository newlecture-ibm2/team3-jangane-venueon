# 🔌 VenueOn 최종 목표 API 스펙 v5 — Part 1

> **작성일:** 2026-04-02  
> **기반:** 목표 아키텍처 v5 + 최종 기능·페이지 정의서 v2  
> **Base URL:** `/api/v1`  
> **인증:** JWT Bearer Token (Authorization: Bearer {token})  
> **공통 응답:** `{ "status": "SUCCESS|ERROR", "data": {...}, "message": "..." }`

---

## 📌 1. User 모듈 (`/api/v1/auth`, `/api/v1/users`)

### 1-1. 인증 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 1 | `POST` | `/auth/signup` | ❌ | 이메일 회원가입 (이메일, 비밀번호, 닉네임) |
| 2 | `POST` | `/auth/signup/verify` | ❌ | 이메일 인증 코드 검증 |
| 3 | `POST` | `/auth/signup/resend` | ❌ | 인증 코드 재발송 |
| 4 | `POST` | `/auth/login` | ❌ | 이메일/비밀번호 로그인 → JWT 발급 |
| 5 | `POST` | `/auth/logout` | 🔑 ALL | 로그아웃 (Redis 블랙리스트) |
| 6 | `POST` | `/auth/refresh` | ❌ | Refresh Token으로 Access Token 재발급 |
| 7 | `POST` | `/auth/forgot-password` | ❌ | 임시 비밀번호 이메일 발송 |
| 8 | `GET` | `/auth/check-email?email=` | ❌ | 이메일 중복 확인 |
| 9 | `GET` | `/auth/oauth2/google` | ❌ | Google OAuth2 로그인 리다이렉트 |
| 10 | `GET` | `/auth/oauth2/google/callback` | ❌ | Google OAuth2 콜백 → JWT 발급 |

#### 상세: `POST /auth/signup`

```json
// Request
{
  "email": "user@example.com",
  "password": "Password1!",
  "nickname": "홍길동",
  "agreeTerms": true,
  "agreePrivacy": true
}
// Response 200
{
  "status": "SUCCESS",
  "data": { "message": "인증 코드가 이메일로 발송되었습니다." }
}
// Error 409: 이메일 중복
// Error 400: 유효성 검증 실패
```

#### 상세: `POST /auth/login`

```json
// Request
{
  "email": "user@example.com",
  "password": "Password1!"
}
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "role": "USER",
      "profileImg": "/upload/profile/1.jpg"
    }
  }
}
// Error 401: 이메일 또는 비밀번호 불일치
// Error 403: 정지된 계정
```

### 1-2. 호스트 인증 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 11 | `POST` | `/auth/host/signup` | ❌ | 호스트 회원가입 (사업자등록번호 포함) |
| 12 | `POST` | `/auth/host/signup/verify` | ❌ | 호스트 이메일 인증 코드 검증 |
| 13 | `POST` | `/auth/host/login` | ❌ | 호스트 로그인 |

### 1-3. 사용자 프로필 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 14 | `GET` | `/users/me` | 🔑 ALL | 내 프로필 조회 |
| 15 | `PUT` | `/users/me` | 🔑 ALL | 프로필 수정 (닉네임, 프로필 이미지) |
| 16 | `PUT` | `/users/me/password` | 🔑 ALL | 비밀번호 변경 |
| 17 | `POST` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 업로드 |
| 18 | `DELETE` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 삭제 |
| 19 | `DELETE` | `/users/me` | 🔑 ALL | 회원 탈퇴 |

#### 상세: `PUT /users/me`

```json
// Request
{ "nickname": "새닉네임" }
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "id": 1, "email": "user@example.com",
    "nickname": "새닉네임", "profileImg": "/upload/profile/1.jpg"
  }
}
```

### 1-4. 관심 카테고리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 20 | `GET` | `/users/me/interest-categories` | 🔑 USER | 내 관심 카테고리 목록 조회 |
| 21 | `PUT` | `/users/me/interest-categories` | 🔑 USER | 관심 카테고리 등록/수정 (복수 선택) |

```json
// PUT Request
{ "categoryIds": [1, 3, 5] }
// Response 200
{
  "status": "SUCCESS",
  "data": [
    { "id": 1, "name": "프로그래밍" },
    { "id": 3, "name": "디자인" },
    { "id": 5, "name": "마케팅" }
  ]
}
```

### 1-5. 사용자 공개 프로필 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 22 | `GET` | `/users/{userId}/profile` | ❌ | 사용자 공개 프로필 조회 |
| 23 | `GET` | `/users/{userId}/posts` | ❌ | 사용자가 작성한 글 목록 (공개 커뮤니티만) |
| 24 | `GET` | `/users/{userId}/comments` | ❌ | 사용자가 작성한 댓글 목록 (공개 커뮤니티만) |
| 25 | `GET` | `/users/{userId}/reviews` | ❌ | 사용자가 작성한 리뷰 목록 |
| 26 | `GET` | `/users/{userId}/communities` | ❌ | 사용자가 참여 중인 공개 커뮤니티 목록 |

#### 상세: `GET /users/{userId}/profile`

```json
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "id": 5,
    "nickname": "홍길동",
    "profileImg": "/upload/profile/5.jpg",
    "createdAt": "2026-01-15T09:00:00",
    "badges": [
      { "id": 1, "badgeName": "Python 기초", "badgeImageUrl": "/upload/badge/1.png", "eventId": 10 }
    ],
    "stats": {
      "postCount": 12,
      "commentCount": 45,
      "reviewCount": 3,
      "badgeCount": 5
    }
  }
}
```

---

## 📌 2. Event 모듈 (`/api/v1/events`)

### 2-1. 이벤트 목록/검색 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 27 | `GET` | `/events` | ❌ | 이벤트 목록 조회 (필터 + 페이지네이션) |
| 28 | `GET` | `/events/recommended` | 🔑 USER | 관심 카테고리 기반 추천 이벤트 |
| 29 | `GET` | `/events/popular` | ❌ | 인기 이벤트 (조회수/참여순) |

#### 상세: `GET /events` — 통합 필터 + 페이지네이션

```
Query Parameters:
  keyword       (string)  — 검색 키워드
  categoryId    (long)    — 카테고리 ID
  type          (string)  — SEMINAR, CLASS, MEETUP, CONFERENCE
  regionSido    (string)  — 시/도
  regionSigungu (string)  — 시/군/구
  startDate     (date)    — 시작일 (YYYY-MM-DD)
  endDate       (date)    — 종료일 (YYYY-MM-DD)
  isOnline      (boolean) — 온라인 여부
  minPrice      (int)     — 최소 가격
  maxPrice      (int)     — 최대 가격
  sort          (string)  — latest, popular, price_asc, price_desc, rating
  page          (int)     — 페이지 번호 (default: 0)
  size          (int)     — 페이지 크기 (default: 12)
```

```json
// Response 200
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
        "location": "서울 강남구",
        "regionSido": "서울",
        "isOnline": false,
        "price": 50000,
        "discountRate": 20,
        "discountedPrice": 40000,
        "startDate": "2026-05-01T10:00:00",
        "endDate": "2026-05-01T18:00:00",
        "maxAttendees": 30,
        "currentAttendees": 12,
        "averageRating": 4.5,
        "reviewCount": 8,
        "creator": { "id": 2, "nickname": "테크캠프" }
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 45,
    "totalPages": 4
  }
}
```

### 2-2. 이벤트 상세 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 30 | `GET` | `/events/{id}` | ❌ | 이벤트 상세 조회 (세션, 할인, 리뷰 포함) |

```json
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "title": "Spring Boot 마스터 클래스",
    "description": "<p>Rich Editor HTML 콘텐츠</p>",
    "thumbnailUrl": "/upload/event/1.jpg",
    "type": "CLASS",
    "status": "PUBLISHED",
    "location": "서울 강남구 삼성동",
    "regionSido": "서울",
    "regionSigungu": "강남구",
    "isOnline": false,
    "sessionLink": null,
    "price": 50000,
    "discountRate": 20,
    "discountedPrice": 40000,
    "discountStart": "2026-04-20T00:00:00",
    "discountEnd": "2026-04-30T23:59:59",
    "maxAttendees": 30,
    "currentAttendees": 12,
    "startDate": "2026-05-01T10:00:00",
    "endDate": "2026-05-01T18:00:00",
    "category": { "id": 1, "name": "프로그래밍" },
    "creator": { "id": 2, "nickname": "테크캠프", "profileImg": "..." },
    "sessions": [
      { "id": 1, "title": "오리엔테이션", "description": "소개", "sortOrder": 1, "startTime": "10:00", "endTime": "11:00" },
      { "id": 2, "title": "Spring Core", "description": "핵심 개념", "sortOrder": 2, "startTime": "11:00", "endTime": "13:00" }
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

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 31 | `POST` | `/events` | 🔑 HOST | 이벤트 생성 (Step 1~4 통합) |
| 32 | `PUT` | `/events/{id}` | 🔑 HOST | 이벤트 수정 (본인 이벤트만) |
| 33 | `DELETE` | `/events/{id}` | 🔑 HOST | 이벤트 삭제 (본인 이벤트만) |
| 34 | `PATCH` | `/events/{id}/status` | 🔑 HOST | 이벤트 상태 변경 (DRAFT→PUBLISHED 등) |
| 35 | `POST` | `/events/{id}/thumbnail` | 🔑 HOST | 이벤트 썸네일 이미지 업로드 |

#### 상세: `POST /events` — Step 1~4 통합

```json
// Request
{
  "title": "Spring Boot 마스터 클래스",
  "description": "<p>Rich Editor HTML</p>",
  "categoryId": 1,
  "type": "CLASS",
  "startDate": "2026-05-01T10:00:00",
  "endDate": "2026-05-01T18:00:00",
  "isOnline": false,
  "location": "서울 강남구 삼성동",
  "regionSido": "서울",
  "regionSigungu": "강남구",
  "sessionLink": null,
  "sessions": [
    { "title": "오리엔테이션", "description": "소개", "sortOrder": 1, "startTime": "10:00", "endTime": "11:00" },
    { "title": "Spring Core", "description": "핵심", "sortOrder": 2, "startTime": "11:00", "endTime": "13:00" }
  ],
  "price": 50000,
  "discountRate": 20,
  "discountStart": "2026-04-20T00:00:00",
  "discountEnd": "2026-04-30T23:59:59",
  "maxAttendees": 30,
  "packageEventIds": [3, 5],
  "status": "DRAFT"
}
// Response 201
{
  "status": "SUCCESS",
  "data": { "id": 1, "title": "Spring Boot 마스터 클래스", "status": "DRAFT" }
}
```

### 2-4. 이벤트 세션 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 36 | `GET` | `/events/{eventId}/sessions` | ❌ | 이벤트 세션 목록 조회 |
| 37 | `POST` | `/events/{eventId}/sessions` | 🔑 HOST | 세션 추가 |
| 38 | `PUT` | `/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 수정 |
| 39 | `DELETE` | `/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 삭제 |
| 40 | `PATCH` | `/events/{eventId}/sessions/reorder` | 🔑 HOST | 세션 순서 변경 |

### 2-5. 호스트 이벤트 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 41 | `GET` | `/host/events` | 🔑 HOST | 내가 등록한 이벤트 목록 (상태별 필터) |
| 42 | `GET` | `/host/events/{id}/attendees` | 🔑 HOST | 이벤트 수강생 목록 |

### 2-6. 리뷰 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 43 | `GET` | `/events/{eventId}/reviews` | ❌ | 이벤트 리뷰 목록 조회 (페이지네이션) |
| 44 | `POST` | `/events/{eventId}/reviews` | 🔑 USER | 리뷰 작성 (수강 완료자만, 1인 1리뷰) |
| 45 | `PUT` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 내 리뷰 수정 |
| 46 | `DELETE` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 내 리뷰 삭제 |

```json
// POST /events/{eventId}/reviews Request
{
  "rating": 5,
  "content": "정말 유익한 강의였습니다!"
}
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 1, "rating": 5, "content": "정말 유익한 강의였습니다!",
    "user": { "id": 1, "nickname": "홍길동" },
    "createdAt": "2026-05-02T10:00:00"
  }
}
// Error 403: 수강 완료하지 않은 사용자
// Error 409: 이미 리뷰 작성한 사용자
```

### 2-7. 카테고리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 47 | `GET` | `/categories` | ❌ | 전체 카테고리 목록 조회 |

---

## 📌 3. Community 모듈 (`/api/v1/communities`)

### 3-1. 커뮤니티 CRUD API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 48 | `GET` | `/communities` | ❌ | 커뮤니티 목록 조회 (공개/비공개 필터) |
| 49 | `GET` | `/communities/{id}` | 🔑 ALL | 커뮤니티 상세 조회 |
| 50 | `POST` | `/communities` | 🔑 USER | 커뮤니티 생성 요청 (어드민 승인 필요) |
| 51 | `PUT` | `/communities/{id}` | 🔑 USER | 커뮤니티 수정 (관리자만) |
| 52 | `DELETE` | `/communities/{id}` | 🔑 ADMIN | 커뮤니티 삭제 |
| 53 | `GET` | `/communities/recommended` | 🔑 USER | 뱃지 기반 추천 커뮤니티 |

```json
// POST /communities Request
{
  "name": "Spring 마스터 모임",
  "description": "Spring Boot 수강생 커뮤니티",
  "purpose": "Spring 기술 교류 및 스터디",
  "rules": "1. 상호 존중 2. 광고 금지",
  "isPublic": true,
  "requiredBadgeIds": [1, 3],
  "popularThresholdLikes": 10,
  "popularThresholdComments": 5,
  "popularThresholdViews": 100
}
// Response 201
{
  "status": "SUCCESS",
  "data": { "id": 1, "name": "Spring 마스터 모임", "approvalStatus": "PENDING" }
}
```

### 3-2. 커뮤니티 멤버 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 54 | `GET` | `/communities/{id}/members` | 🔑 ALL | 멤버 목록 (상태별/이름 검색) |
| 55 | `POST` | `/communities/{id}/join` | 🔑 USER | 커뮤니티 가입 |
| 56 | `DELETE` | `/communities/{id}/leave` | 🔑 USER | 커뮤니티 탈퇴 |
| 57 | `PATCH` | `/communities/{id}/members/{userId}/role` | 🔑 USER | 멤버 권한 변경 (관리자만) |

```json
// PATCH Request — 권한 변경
{ "role": "SUB_ADMIN" }
// role 옵션: ADMIN, SUB_ADMIN, READ_WRITE, READ_ONLY, BLOCKED
```

### 3-3. 게시글 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 58 | `GET` | `/communities/{id}/posts` | 🔑 ALL | 게시글 목록 (타입 필터 + 검색 + 페이지네이션) |
| 59 | `GET` | `/communities/{id}/posts/popular` | 🔑 ALL | 인기글 목록 |
| 60 | `GET` | `/communities/{id}/posts/pinned` | 🔑 ALL | 공지/고정 게시글 |
| 61 | `POST` | `/communities/{id}/posts` | 🔑 USER | 게시글 작성 (Rich Editor) |
| 62 | `GET` | `/communities/{id}/posts/{postId}` | 🔑 ALL | 게시글 상세 조회 |
| 63 | `PUT` | `/communities/{id}/posts/{postId}` | 🔑 USER | 게시글 수정 (본인만) |
| 64 | `DELETE` | `/communities/{id}/posts/{postId}` | 🔑 USER | 게시글 삭제 (본인/관리자) |
| 65 | `PATCH` | `/communities/{id}/posts/{postId}/pin` | 🔑 USER | 게시글 상단 고정 (관리자만) |
| 66 | `POST` | `/communities/{id}/posts/{postId}/like` | 🔑 USER | 게시글 좋아요 토글 |
| 67 | `POST` | `/communities/{id}/posts/{postId}/bookmark` | 🔑 USER | 게시글 북마크 토글 |

```
GET /communities/{id}/posts Query Parameters:
  type     (string)  — GENERAL, REVIEW, QUESTION, NOTICE
  keyword  (string)  — 검색어
  page     (int)     — 페이지 번호
  size     (int)     — 페이지 크기
```

### 3-4. 댓글 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 68 | `GET` | `/posts/{postId}/comments` | 🔑 ALL | 댓글 목록 (대댓글 트리 구조) |
| 69 | `POST` | `/posts/{postId}/comments` | 🔑 USER | 댓글 작성 |
| 70 | `POST` | `/posts/{postId}/comments` | 🔑 USER | 대댓글 작성 (parentId 포함) |
| 71 | `PUT` | `/comments/{commentId}` | 🔑 USER | 댓글 수정 (본인만) |
| 72 | `DELETE` | `/comments/{commentId}` | 🔑 USER | 댓글 삭제 (본인/관리자) |
| 73 | `POST` | `/comments/{commentId}/like` | 🔑 USER | 댓글 좋아요 토글 |

```json
// POST /posts/{postId}/comments Request
{
  "content": "좋은 글 감사합니다!",
  "parentId": null
}
// 대댓글: parentId에 상위 댓글 ID 입력
{
  "content": "저도 동의합니다!",
  "parentId": 5
}
```

---

## 📌 4. Payment 모듈 (`/api/v1/orders`)

### 4-1. 주문/결제 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 74 | `POST` | `/orders` | 🔑 USER | 주문 생성 (결제 전 PENDING 상태) |
| 75 | `POST` | `/orders/checkout` | 🔑 USER | 장바구니 일괄 주문 생성 |
| 76 | `POST` | `/orders/{id}/confirm` | 🔑 USER | 토스 결제 승인 요청 |
| 77 | `POST` | `/orders/toss/webhook` | ❌ (서버) | 토스 Webhook 결제 검증 |
| 78 | `GET` | `/orders/{id}` | 🔑 USER | 주문 상세 조회 |
| 79 | `GET` | `/orders/me` | 🔑 USER | 내 주문/결제 내역 (페이지네이션) |

#### 상세: `POST /orders` — 단건 주문

```json
// Request
{
  "eventId": 1,
  "quantity": 1,
  "paymentMethod": "CARD"
}
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "orderId": 100,
    "tossOrderId": "venueon_order_100_1680000000",
    "amount": 40000,
    "orderName": "Spring Boot 마스터 클래스",
    "customerName": "홍길동",
    "customerEmail": "user@example.com",
    "tossClientKey": "test_ck_xxxxxxxx"
  }
}
```

#### 상세: `POST /orders/{id}/confirm` — 토스 결제 승인

```json
// Request (토스 SDK 콜백 데이터)
{
  "paymentKey": "toss_payment_key_xxxx",
  "orderId": "venueon_order_100_1680000000",
  "amount": 40000
}
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "orderId": 100,
    "status": "PAID",
    "amount": 40000,
    "paymentMethod": "CARD",
    "paidAt": "2026-04-15T14:30:00"
  }
}
// Error 400: 결제 금액 불일치
// Error 402: 토스 결제 실패
```

### 4-2. 환불 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 80 | `POST` | `/orders/{orderId}/refund` | 🔑 USER | 환불 요청 |
| 81 | `GET` | `/refunds/me` | 🔑 USER | 내 환불 내역 |
| 82 | `POST` | `/host/orders/{orderId}/refund` | 🔑 HOST | 호스트 직접 환불 처리 |
| 83 | `GET` | `/host/payments` | 🔑 HOST | 호스트 결제 내역 목록 |
| 84 | `GET` | `/host/refunds` | 🔑 HOST | 호스트 환불 이력 |

```json
// POST /orders/{orderId}/refund Request
{
  "reason": "일정이 변경되어 참석이 어렵습니다."
}
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "refundId": 1,
    "orderId": 100,
    "amount": 40000,
    "status": "PENDING",
    "reason": "일정이 변경되어 참석이 어렵습니다.",
    "requestedAt": "2026-04-16T10:00:00"
  }
}
```

---

> **Part 2에서 계속:** Wishlist/Cart, Badge, Notification, Admin, Notice, Report 모듈
