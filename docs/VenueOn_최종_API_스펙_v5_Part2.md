# 🔌 VenueOn 최종 목표 API 스펙 v5 — Part 2

> **작성일:** 2026-04-02  
> **기반:** 목표 아키텍처 v5 + 최종 기능·페이지 정의서 v2  
> **Part 1 연속:** User(#1~26) + Event(#27~47) + Community(#48~73) + Payment(#74~84)

---

## 📌 5. Wishlist / Cart 모듈 (`/api/v1/wishlist`, `/api/v1/cart`)

### 5-1. 찜 목록 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 85 | `GET` | `/wishlist` | 🔑 USER | 내 찜 목록 조회 |
| 86 | `POST` | `/wishlist` | 🔑 USER | 찜 추가 |
| 87 | `DELETE` | `/wishlist/{eventId}` | 🔑 USER | 찜 해제 |
| 88 | `POST` | `/wishlist/{eventId}/to-cart` | 🔑 USER | 찜 → 장바구니 이동 |

```json
// POST /wishlist Request
{ "eventId": 1 }
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "event": {
      "id": 1, "title": "Spring Boot 마스터 클래스",
      "thumbnailUrl": "/upload/event/1.jpg",
      "price": 50000, "discountedPrice": 40000
    },
    "createdAt": "2026-04-15T10:00:00"
  }
}
// Error 409: 이미 찜한 이벤트
```

### 5-2. 수강 바구니 (장바구니) API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 89 | `GET` | `/cart` | 🔑 USER | 장바구니 목록 조회 |
| 90 | `POST` | `/cart` | 🔑 USER | 장바구니 추가 |
| 91 | `PATCH` | `/cart/{cartId}` | 🔑 USER | 수량 변경 |
| 92 | `DELETE` | `/cart/{cartId}` | 🔑 USER | 장바구니 항목 삭제 |
| 93 | `GET` | `/cart/summary` | 🔑 USER | 장바구니 요약 (총 금액, 할인 등) |

```json
// GET /cart Response 200
{
  "status": "SUCCESS",
  "data": {
    "items": [
      {
        "cartId": 1,
        "event": {
          "id": 1, "title": "Spring Boot 마스터 클래스",
          "price": 50000, "discountedPrice": 40000,
          "startDate": "2026-05-01T10:00:00"
        },
        "quantity": 1,
        "subtotal": 40000
      }
    ],
    "totalAmount": 40000,
    "totalDiscount": 10000,
    "itemCount": 1
  }
}
```

---

## 📌 6. Badge 모듈 (`/api/v1/badges`)

### 6-1. 뱃지 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 94 | `GET` | `/badges/me` | 🔑 USER | 내 뱃지 목록 조회 |
| 95 | `PATCH` | `/badges/{badgeId}/visibility` | 🔑 USER | 뱃지 공개/비공개 토글 |
| 96 | `GET` | `/badges/search` | 🔑 USER | 뱃지 보유자 검색 |
| 97 | `POST` | `/badges/invite` | 🔑 USER | 뱃지 보유자 커뮤니티 초대 |

#### 상세: `GET /badges/search` — 뱃지 보유자 검색

```
Query Parameters:
  badgeNames    (string[]) — 뱃지명 목록 (복수 가능)
  eventIds      (long[])   — 이벤트 ID 목록 (복수 가능)
  page          (int)
  size          (int)
```

```json
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "content": [
      {
        "userId": 5,
        "nickname": "홍길동",
        "profileImg": "/upload/profile/5.jpg",
        "badges": [
          { "id": 1, "badgeName": "Python 기초", "badgeImageUrl": "/upload/badge/1.png" },
          { "id": 3, "badgeName": "Spring Boot", "badgeImageUrl": "/upload/badge/3.png" }
        ]
      }
    ],
    "totalElements": 12,
    "page": 0, "size": 10
  }
}
```

#### 상세: `POST /badges/invite`

```json
// Request
{
  "communityId": 5,
  "userIds": [3, 7, 12]
}
// Response 200
{
  "status": "SUCCESS",
  "data": { "invitedCount": 3, "communityId": 5 }
}
```

> **뱃지 자동 발급:** ORDER 상태가 `COMPLETED`로 변경될 때 서버 내부에서 자동으로 Badge를 생성하므로, 별도의 발급 API는 없습니다. (내부 이벤트 트리거)

---

## 📌 7. Notification 모듈 (`/api/v1/notifications`)

### 7-1. 알림 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 98 | `GET` | `/notifications` | 🔑 ALL | 내 알림 목록 조회 (시간순, 페이지네이션) |
| 99 | `GET` | `/notifications/unread-count` | 🔑 ALL | 미확인 알림 수 (헤더 배지용) |
| 100 | `PATCH` | `/notifications/{id}/read` | 🔑 ALL | 개별 알림 읽음 처리 |
| 101 | `PATCH` | `/notifications/read-all` | 🔑 ALL | 전체 알림 읽음 처리 |

```json
// GET /notifications Response 200
{
  "status": "SUCCESS",
  "data": {
    "content": [
      {
        "id": 1,
        "type": "COMMENT",
        "title": "새 댓글",
        "message": "홍길동님이 내 게시물에 댓글을 달았습니다.",
        "linkUrl": "/community/5/posts/12",
        "isRead": false,
        "createdAt": "2026-04-15T14:30:00"
      },
      {
        "id": 2,
        "type": "PAYMENT",
        "title": "결제 완료",
        "message": "Spring Boot 마스터 클래스 결제가 완료되었습니다.",
        "linkUrl": "/mypage/orders",
        "isRead": true,
        "createdAt": "2026-04-15T10:00:00"
      }
    ],
    "page": 0, "size": 20, "totalElements": 45
  }
}
// GET /notifications/unread-count Response 200
{
  "status": "SUCCESS",
  "data": { "unreadCount": 3 }
}
```

> **알림 유형 (5종):** `COMMENT`(내 게시물 댓글), `LECTURE`(강의 일정 변경/시작 임박), `SANCTION`(경고/정지), `PAYMENT`(결제/환불), `REPORT`(신고 처리 결과)

---

## 📌 8. Report 모듈 (`/api/v1/reports`, `/api/v1/refunds`)

### 8-1. 신고 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 102 | `POST` | `/reports` | 🔑 ALL | 신고 접수 |
| 103 | `GET` | `/reports/me` | 🔑 ALL | 내가 접수한 신고 이력 |

```json
// POST /reports Request
{
  "targetType": "POST",
  "targetId": 15,
  "reason": "SPAM",
  "detail": "반복적인 광고 게시물입니다."
}
// targetType: EVENT, POST, COMMENT, USER, REVIEW
// reason: SPAM, INAPPROPRIATE, FALSE_INFO, COPYRIGHT, OTHER
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "targetType": "POST",
    "targetId": 15,
    "status": "RECEIVED",
    "createdAt": "2026-04-15T10:00:00"
  }
}
```

### 8-2. 이의 제기 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 104 | `POST` | `/reports/{reportId}/objection` | 🔑 ALL | 신고에 대한 이의 제기 |
| 105 | `GET` | `/reports/{reportId}/objection` | 🔑 ALL | 이의 제기 상태 조회 |

---

## 📌 9. Admin 모듈 (`/api/v1/admin`)

### 9-1. 회원 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 106 | `GET` | `/admin/users` | 🔑 ADMIN | 전체 회원 목록 (키워드/역할 필터) |
| 107 | `GET` | `/admin/users/{id}` | 🔑 ADMIN | 회원 상세 프로필 + 활동 이력 |
| 108 | `PATCH` | `/admin/users/{id}/role` | 🔑 ADMIN | 권한 변경 (USER↔HOST↔ADMIN) |
| 109 | `PATCH` | `/admin/users/{id}/suspend` | 🔑 ADMIN | 회원 정지 (일시/영구) |
| 110 | `PATCH` | `/admin/users/{id}/unsuspend` | 🔑 ADMIN | 회원 정지 해제 |
| 111 | `PATCH` | `/admin/users/{id}/warn` | 🔑 ADMIN | 회원 경고 |
| 112 | `DELETE` | `/admin/users/{id}` | 🔑 ADMIN | 회원 비활성화 (is_active=false) |

```json
// PATCH /admin/users/{id}/suspend Request
{
  "suspensionType": "TEMP",
  "suspensionUntil": "2026-05-01T00:00:00",
  "reason": "커뮤니티 운영 규칙 위반"
}
// suspensionType: TEMP(일시 정지), PERMANENT(영구 정지)
```

### 9-2. 카테고리 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 113 | `GET` | `/admin/categories` | 🔑 ADMIN | 카테고리 목록 (이벤트 수 포함) |
| 114 | `POST` | `/admin/categories` | 🔑 ADMIN | 카테고리 생성 |
| 115 | `PUT` | `/admin/categories/{id}` | 🔑 ADMIN | 카테고리 수정 |
| 116 | `DELETE` | `/admin/categories/{id}` | 🔑 ADMIN | 카테고리 삭제 |
| 117 | `PATCH` | `/admin/categories/reorder` | 🔑 ADMIN | 카테고리 순서 변경 |

### 9-3. 관심 카테고리 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 118 | `GET` | `/admin/interest-categories` | 🔑 ADMIN | 관심 카테고리 항목 관리 목록 |
| 119 | `GET` | `/admin/interest-categories/stats` | 🔑 ADMIN | 카테고리별 관심 등록 통계 |

### 9-4. 신고 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 120 | `GET` | `/admin/reports` | 🔑 ADMIN | 신고 목록 (targetType, status 필터) |
| 121 | `GET` | `/admin/reports/{id}` | 🔑 ADMIN | 신고 상세 |
| 122 | `PATCH` | `/admin/reports/{id}/status` | 🔑 ADMIN | 신고 처리 단계 변경 |
| 123 | `PATCH` | `/admin/reports/{id}/action` | 🔑 ADMIN | 신고 조치 (DELETE/HIDE/WARN/SUSPEND/DISMISS) |
| 124 | `GET` | `/admin/reports/history?userId=` | 🔑 ADMIN | 특정 유저 신고 이력 추적 |

```json
// PATCH /admin/reports/{id}/action Request
{
  "action": "SUSPEND",
  "sanctionType": "TEMP_SUSPEND",
  "suspensionDays": 7,
  "adminNote": "반복적인 규칙 위반"
}
// action: DELETE, HIDE, WARN, SUSPEND, DISMISS
// sanctionType: NONE, WARNING, TEMP_SUSPEND, PERM_SUSPEND
```

### 9-5. 커뮤니티 개설 요청 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 125 | `GET` | `/admin/community-requests` | 🔑 ADMIN | 커뮤니티 개설 요청 목록 |
| 126 | `PATCH` | `/admin/community-requests/{id}/approve` | 🔑 ADMIN | 커뮤니티 개설 승인 |
| 127 | `PATCH` | `/admin/community-requests/{id}/reject` | 🔑 ADMIN | 커뮤니티 개설 거절 |

### 9-6. 호스트 요청 처리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 128 | `GET` | `/admin/requests` | 🔑 ADMIN | 호스트 요청 목록 (카테고리별 필터) |
| 129 | `PATCH` | `/admin/requests/{id}/approve` | 🔑 ADMIN | 요청 승인 |
| 130 | `PATCH` | `/admin/requests/{id}/reject` | 🔑 ADMIN | 요청 거절 |

### 9-7. 리뷰 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 131 | `GET` | `/admin/reviews` | 🔑 ADMIN | 전체 리뷰 목록 (신고된 리뷰 우선) |
| 132 | `PATCH` | `/admin/reviews/{id}/hide` | 🔑 ADMIN | 리뷰 숨김 처리 |
| 133 | `DELETE` | `/admin/reviews/{id}` | 🔑 ADMIN | 리뷰 삭제 |

### 9-8. 환불 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 134 | `GET` | `/admin/refunds` | 🔑 ADMIN | 환불 목록 (긴급 우선 정렬) |
| 135 | `PATCH` | `/admin/refunds/{id}/approve` | 🔑 ADMIN | 환불 승인 |
| 136 | `PATCH` | `/admin/refunds/{id}/reject` | 🔑 ADMIN | 환불 거절 |

### 9-9. 커뮤니티 제재 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 137 | `GET` | `/admin/communities` | 🔑 ADMIN | 전체 커뮤니티 목록 + 제재 현황 |
| 138 | `GET` | `/admin/communities/{id}/sanctions` | 🔑 ADMIN | 커뮤니티별 제재 사용자 목록 |
| 139 | `PATCH` | `/admin/communities/{id}/members/{userId}/sanction` | 🔑 ADMIN | 제재 상태 변경 |

### 9-10. 이벤트 관리 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 140 | `GET` | `/admin/events` | 🔑 ADMIN | 전체 이벤트 목록 |
| 141 | `PATCH` | `/admin/events/{id}/hide` | 🔑 ADMIN | 이벤트 숨김 처리 |
| 142 | `DELETE` | `/admin/events/{id}` | 🔑 ADMIN | 이벤트 삭제 |

### 9-11. 대시보드 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 143 | `GET` | `/admin/dashboard` | 🔑 ADMIN | 대시보드 요약 (총 회원/강의/신고/환불) |

```json
// GET /admin/dashboard Response 200
{
  "status": "SUCCESS",
  "data": {
    "totalUsers": 1250,
    "totalHosts": 85,
    "totalEvents": 320,
    "totalActiveEvents": 45,
    "pendingReports": 12,
    "pendingRefunds": 3,
    "todaySignups": 8,
    "todayOrders": 15
  }
}
```

---

## 📌 10. Notice 모듈 (`/api/v1/notices`, `/api/v1/requests`)

### 10-1. 공지사항 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 144 | `GET` | `/notices` | ❌ | 공지 목록 (타입/대상 필터, 페이지네이션) |
| 145 | `GET` | `/notices/{id}` | ❌ | 공지 상세 |
| 146 | `POST` | `/notices` | 🔑 ADMIN | 공지 작성 |
| 147 | `PUT` | `/notices/{id}` | 🔑 ADMIN | 공지 수정 |
| 148 | `DELETE` | `/notices/{id}` | 🔑 ADMIN | 공지 삭제 |
| 149 | `PATCH` | `/notices/{id}/pin` | 🔑 ADMIN | 공지 고정/해제 |

```
GET /notices Query Parameters:
  type       (string)  — GUIDE, ANNOUNCEMENT, QNA, OBJECTION
  targetRole (string)  — ALL, USER, HOST
  page       (int)
  size       (int)
```

### 10-2. 호스트 요청 게시판 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 150 | `GET` | `/requests/me` | 🔑 HOST | 내가 작성한 요청 목록 |
| 151 | `POST` | `/requests` | 🔑 HOST | 요청 작성 |
| 152 | `GET` | `/requests/{id}` | 🔑 HOST | 요청 상세 |

```json
// POST /requests Request
{
  "category": "REVIEW",
  "title": "허위 리뷰 삭제 요청",
  "content": "리뷰 ID 25번이 허위 내용을 포함하고 있습니다.",
  "targetId": 25
}
// category: COMMUNITY, REVIEW, COMMENT
```

### 10-3. 커뮤니티 관리자 요청 API

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 153 | `GET` | `/communities/{id}/requests` | 🔑 USER | 해당 커뮤니티 요청 목록 (관리자만) |
| 154 | `PATCH` | `/communities/{id}/requests/{reqId}/approve` | 🔑 USER | 요청 승인 |
| 155 | `PATCH` | `/communities/{id}/requests/{reqId}/reject` | 🔑 USER | 요청 거절 |

---

## 📌 11. 마이페이지 통합 API (`/api/v1/mypage`)

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 156 | `GET` | `/mypage/summary` | 🔑 USER | 대시보드 요약 (수강중/완료/찜 수) |
| 157 | `GET` | `/mypage/events?tab=ongoing` | 🔑 USER | 수강 중인 강의 목록 |
| 158 | `GET` | `/mypage/events?tab=completed` | 🔑 USER | 수강 완료 강의 목록 |
| 159 | `GET` | `/mypage/communities?tab=joined` | 🔑 USER | 내가 참여 중인 커뮤니티 |
| 160 | `GET` | `/mypage/communities?tab=bookmarked` | 🔑 USER | 북마크한 커뮤니티 |
| 161 | `GET` | `/mypage/communities?tab=my-posts` | 🔑 USER | 내가 쓴 게시물 |
| 162 | `GET` | `/mypage/communities?tab=bookmarked-posts` | 🔑 USER | 북마크한 게시물 |

---

## 📌 12. 파일 업로드 API (`/api/v1/upload`)

| # | Method | Path | Auth | 설명 |
|---|--------|------|------|------|
| 163 | `POST` | `/upload/image` | 🔑 ALL | 이미지 업로드 (프로필/썸네일/에디터) |

```json
// Request: multipart/form-data
//   file: (binary)
//   type: "profile" | "event" | "community" | "editor"
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "url": "/upload/event/abc123.jpg",
    "originalName": "image.jpg",
    "size": 204800
  }
}
```

---

## 📌 전체 API 요약

| 모듈 | API 수 | 주요 기능 |
|------|--------|----------|
| **User** (인증/프로필) | #1~26 | 회원가입, 로그인, OAuth2, 프로필, 공개 프로필 |
| **Event** (이벤트) | #27~47 | 이벤트 CRUD, 필터/검색, 세션, 리뷰, 카테고리 |
| **Community** (커뮤니티) | #48~73 | 커뮤니티 CRUD, 멤버 관리, 게시글, 댓글, 좋아요 |
| **Payment** (결제) | #74~84 | 주문, 토스 결제, 환불 |
| **Wishlist/Cart** (찜/장바구니) | #85~93 | 찜 목록, 수강 바구니 |
| **Badge** (뱃지) | #94~97 | 뱃지 조회, 노출 설정, 보유자 검색/초대 |
| **Notification** (알림) | #98~101 | 알림 5종 조회, 읽음 처리 |
| **Report** (신고) | #102~105 | 신고 접수, 이의 제기 |
| **Admin** (관리자) | #106~143 | 회원/카테고리/신고/환불/커뮤니티/리뷰 관리 |
| **Notice** (공지) | #144~155 | 공지사항, 요청 게시판 |
| **Mypage** (마이페이지) | #156~162 | 마이페이지 통합 조회 |
| **Upload** (파일) | #163 | 이미지 업로드 |
| **합계** | **163개** | |

---

## 📌 공통 에러 코드

| HTTP Code | Error Code | 설명 |
|-----------|------------|------|
| `400` | `BAD_REQUEST` | 유효성 검증 실패 |
| `401` | `UNAUTHORIZED` | 인증 실패 (JWT 없음/만료) |
| `403` | `FORBIDDEN` | 권한 없음 (역할 불일치) |
| `404` | `NOT_FOUND` | 리소스 없음 |
| `409` | `CONFLICT` | 중복 (이메일, 리뷰, 찜 등) |
| `422` | `UNPROCESSABLE` | 비즈니스 규칙 위반 (정지 계정, 수강 미완료 등) |
| `500` | `INTERNAL_ERROR` | 서버 내부 오류 |

```json
// 공통 에러 응답 형식
{
  "status": "ERROR",
  "code": "FORBIDDEN",
  "message": "수강 완료한 사용자만 리뷰를 작성할 수 있습니다.",
  "timestamp": "2026-04-15T14:30:00"
}
```

---

> 📌 **작성일:** 2026-04-02  
> 📌 **기반 문서:** [VenueOn_목표_아키텍처_v5.md](./VenueOn_목표_아키텍처_v5.md), [VenueOn_최종_기능_페이지_정의서.md](./VenueOn_최종_기능_페이지_정의서.md)
