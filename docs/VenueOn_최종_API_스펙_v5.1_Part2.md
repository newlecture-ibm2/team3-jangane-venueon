## 📌 5. Wishlist / Cart 모듈 (`/api/v1/wishlist`, `/api/v1/cart`)

### 5-1. 찜 목록 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 89 | `GET` | `/wishlist?page=&size=` | 🔑 USER | 내 찜 목록 조회 (페이지네이션) | — |
| 90 | `POST` | `/wishlist` | 🔑 USER | 찜 추가 | `404` 이벤트 없음, `409` 이미 찜함 |
| 91 | `DELETE` | `/wishlist/{eventId}` | 🔑 USER | 찜 해제 | `404` 찜 내역 없음 |
| 92 | `POST` | `/wishlist/{eventId}/to-cart` | 🔑 USER | 찜 → 장바구니 이동 | `409` 이미 장바구니에 있음 |

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
      "price": 50000, "discountedPrice": 40000,
      "startDate": "2026-05-01T10:00:00"
    },
    "createdAt": "2026-04-15T10:00:00"
  }
}
```

### 5-2. 수강 바구니 (장바구니) API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 93 | `GET` | `/cart` | 🔑 USER | 장바구니 목록 조회 | — |
| 94 | `POST` | `/cart` | 🔑 USER | 장바구니 추가 | `404` 이벤트 없음, `409` 이미 담김, `422` 정원 초과 |
| 95 | `PATCH` | `/cart/{cartId}` | 🔑 USER | 수량 변경 | `400` 유효하지 않은 수량 |
| 96 | `DELETE` | `/cart/{cartId}` | 🔑 USER | 장바구니 항목 삭제 | `404` |
| 97 | `GET` | `/cart/summary` | 🔑 USER | 장바구니 요약 (총 금액, 할인) | — |

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
        "quantity": 1, "subtotal": 40000
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

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 98 | `GET` | `/badges/me?page=&size=` | 🔑 USER | 내 뱃지 목록 조회 (페이지네이션) | — |
| 99 | `PATCH` | `/badges/{badgeId}/visibility` | 🔑 USER | 뱃지 공개/비공개 토글 | `403` 타인 뱃지, `404` |
| 100 | `GET` | `/badges/search?badgeNames=&eventIds=&page=&size=` | 🔑 USER | 뱃지 보유자 검색 | — |
| 101 | `POST` | `/badges/invite` | 🔑 USER | 뱃지 보유자 커뮤니티 초대 | `403` 커뮤니티 관리자 아님 |

```json
// GET /badges/search Response 200
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
    "page": 0, "size": 10, "totalElements": 12
  }
}
// POST /badges/invite Request
{ "communityId": 5, "userIds": [3, 7, 12] }
// Response 200
{ "status": "SUCCESS", "data": { "invitedCount": 3, "communityId": 5 } }
```

> **뱃지 자동 발급:** ORDER 상태가 `COMPLETED`로 변경될 때 서버 내부에서 자동으로 Badge를 생성합니다. (내부 이벤트 트리거, 별도 발급 API 없음)

---

## 📌 7. Notification 모듈 (`/api/v1/notifications`)

### 7-1. 알림 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 102 | `GET` | `/notifications?page=&size=` | 🔑 ALL | 내 알림 목록 (시간순, 페이지네이션) | — |
| 103 | `GET` | `/notifications/unread-count` | 🔑 ALL | 미확인 알림 수 (헤더 배지용) | — |
| 104 | `PATCH` | `/notifications/{id}/read` | 🔑 ALL | 개별 알림 읽음 처리 | `403` 타인 알림, `404` |
| 105 | `PATCH` | `/notifications/read-all` | 🔑 ALL | 전체 알림 읽음 처리 | — |

```json
// GET /notifications Response 200
{
  "status": "SUCCESS",
  "data": {
    "content": [
      {
        "id": 1, "type": "COMMENT",
        "title": "새 댓글",
        "message": "홍길동님이 내 게시물에 댓글을 달았습니다.",
        "linkUrl": "/community/5/posts/12",
        "isRead": false,
        "createdAt": "2026-04-15T14:30:00"
      },
      {
        "id": 2, "type": "PAYMENT",
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
{ "status": "SUCCESS", "data": { "unreadCount": 3 } }
```

> **알림 유형 (5종):**
> - `COMMENT` — 내 게시물에 새 댓글
> - `LECTURE` — 강의 일정 변경, 시작 임박
> - `SANCTION` — 경고, 정지 등 제재 발생
> - `PAYMENT` — 결제 완료, 환불 승인/거절
> - `REPORT` — 내가 접수한 신고의 처리 결과

---

## 📌 8. Report 모듈 (`/api/v1/reports`)

### 8-1. 신고 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 106 | `POST` | `/reports` | 🔑 ALL | 신고 접수 | `400` 유효성, `409` 동일 대상 중복 신고 |
| 107 | `GET` | `/reports/me?page=&size=` | 🔑 ALL | 내가 접수한 신고 이력 (페이지네이션) | — |

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
    "id": 1, "targetType": "POST", "targetId": 15,
    "status": "RECEIVED", "createdAt": "2026-04-15T10:00:00"
  }
}
```

### 8-2. 이의 제기 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 108 | `POST` | `/reports/{reportId}/objection` | 🔑 ALL | 신고에 대한 이의 제기 | `404` 신고 없음, `422` 이미 제기함 |
| 109 | `GET` | `/reports/{reportId}/objection` | 🔑 ALL | 이의 제기 상태 조회 | `404` |

---

## 📌 9. Admin 모듈 (`/api/v1/admin`)

### 9-1. 대시보드 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 110 | `GET` | `/admin/dashboard` | 🔑 ADMIN | 대시보드 요약 | — |

```json
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "totalUsers": 1250, "totalHosts": 85,
    "totalEvents": 320, "totalActiveEvents": 45,
    "pendingReports": 12, "pendingRefunds": 3,
    "todaySignups": 8, "todayOrders": 15
  }
}
```

### 9-2. 회원 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 111 | `GET` | `/admin/users?role=&keyword=&page=&size=` | 🔑 ADMIN | 전체 회원 목록 | — |
| 112 | `GET` | `/admin/users/{id}` | 🔑 ADMIN | 회원 상세 + 활동 이력 | `404` |
| 113 | `PATCH` | `/admin/users/{id}/role` | 🔑 ADMIN | 권한 변경 (USER↔HOST↔ADMIN) | `400` 동일 권한 |
| 114 | `PATCH` | `/admin/users/{id}/suspend` | 🔑 ADMIN | 회원 정지 (일시/영구) | `422` 이미 정지 |
| 115 | `PATCH` | `/admin/users/{id}/unsuspend` | 🔑 ADMIN | 정지 해제 | `422` 정지 상태 아님 |
| 116 | `PATCH` | `/admin/users/{id}/warn` | 🔑 ADMIN | 회원 경고 | — |
| 117 | `DELETE` | `/admin/users/{id}` | 🔑 ADMIN | 회원 비활성화 | — |

```json
// PATCH /admin/users/{id}/suspend Request
{
  "suspensionType": "TEMP",
  "suspensionUntil": "2026-05-01T00:00:00",
  "reason": "커뮤니티 운영 규칙 위반"
}
// suspensionType: TEMP(일시), PERMANENT(영구)
```

### 9-3. 카테고리 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 118 | `GET` | `/admin/categories` | 🔑 ADMIN | 카테고리 목록 (이벤트 수 포함) | — |
| 119 | `POST` | `/admin/categories` | 🔑 ADMIN | 카테고리 생성 | `409` 이름 중복 |
| 120 | `PUT` | `/admin/categories/{id}` | 🔑 ADMIN | 카테고리 수정 | `404` |
| 121 | `DELETE` | `/admin/categories/{id}` | 🔑 ADMIN | 카테고리 삭제 | `422` 사용 중인 카테고리 |
| 122 | `PATCH` | `/admin/categories/reorder` | 🔑 ADMIN | 순서 변경 | — |

### 9-4. 관심 카테고리 관리 API (🆕 v5.1 CRUD 완성)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 123 | `GET` | `/admin/interest-categories` | 🔑 ADMIN | 관심 카테고리 항목 목록 | — |
| 124 | `POST` | `/admin/interest-categories` | 🔑 ADMIN | 🆕 관심 카테고리 추가 | `409` 중복 |
| 125 | `PUT` | `/admin/interest-categories/{id}` | 🔑 ADMIN | 🆕 관심 카테고리 수정 | `404` |
| 126 | `DELETE` | `/admin/interest-categories/{id}` | 🔑 ADMIN | 🆕 관심 카테고리 삭제 | `422` 사용 중 |
| 127 | `GET` | `/admin/interest-categories/stats` | 🔑 ADMIN | 카테고리별 관심 등록 통계 | — |

### 9-5. 신고 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 128 | `GET` | `/admin/reports?targetType=&status=&page=&size=` | 🔑 ADMIN | 신고 목록 (필터) | — |
| 129 | `GET` | `/admin/reports/{id}` | 🔑 ADMIN | 신고 상세 | `404` |
| 130 | `PATCH` | `/admin/reports/{id}/status` | 🔑 ADMIN | 처리 단계 변경 (상태 전이 규칙 참고) | `422` 잘못된 전이 |
| 131 | `PATCH` | `/admin/reports/{id}/action` | 🔑 ADMIN | 조치 (DELETE/HIDE/WARN/SUSPEND/DISMISS) | — |
| 132 | `GET` | `/admin/reports/history?userId=&page=&size=` | 🔑 ADMIN | 특정 유저 신고 이력 추적 | `404` |

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

### 9-6. 커뮤니티 개설 요청 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 133 | `GET` | `/admin/community-requests?page=&size=` | 🔑 ADMIN | 커뮤니티 개설 요청 목록 | — |
| 134 | `PATCH` | `/admin/community-requests/{id}/approve` | 🔑 ADMIN | 개설 승인 | `404`, `422` 이미 처리 |
| 135 | `PATCH` | `/admin/community-requests/{id}/reject` | 🔑 ADMIN | 개설 거절 | `404`, `422` 이미 처리 |

### 9-7. 호스트 요청 처리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 136 | `GET` | `/admin/requests?category=&status=&page=&size=` | 🔑 ADMIN | 호스트 요청 목록 (카테고리별 필터) | — |
| 137 | `PATCH` | `/admin/requests/{id}/approve` | 🔑 ADMIN | 요청 승인 | `404`, `422` 이미 처리 |
| 138 | `PATCH` | `/admin/requests/{id}/reject` | 🔑 ADMIN | 요청 거절 | `404`, `422` 이미 처리 |

### 9-8. 리뷰 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 139 | `GET` | `/admin/reviews?page=&size=` | 🔑 ADMIN | 전체 리뷰 목록 (신고된 리뷰 우선) | — |
| 140 | `PATCH` | `/admin/reviews/{id}/hide` | 🔑 ADMIN | 리뷰 숨김 처리 | `404` |
| 141 | `DELETE` | `/admin/reviews/{id}` | 🔑 ADMIN | 리뷰 삭제 | `404` |

### 9-9. 환불 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 142 | `GET` | `/admin/refunds?status=&page=&size=` | 🔑 ADMIN | 환불 목록 (긴급 우선) | — |
| 143 | `PATCH` | `/admin/refunds/{id}/approve` | 🔑 ADMIN | 환불 승인 | `404`, `422` 이미 처리 |
| 144 | `PATCH` | `/admin/refunds/{id}/reject` | 🔑 ADMIN | 환불 거절 | `404`, `422` 이미 처리 |

### 9-10. 커뮤니티 제재 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 145 | `GET` | `/admin/communities?page=&size=` | 🔑 ADMIN | 전체 커뮤니티 + 제재 현황 | — |
| 146 | `GET` | `/admin/communities/{id}/sanctions?page=&size=` | 🔑 ADMIN | 커뮤니티별 제재 사용자 목록 | `404` |
| 147 | `PATCH` | `/admin/communities/{id}/members/{userId}/sanction` | 🔑 ADMIN | 제재 상태 변경 | `404` |

### 9-11. 이벤트 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 148 | `GET` | `/admin/events?page=&size=` | 🔑 ADMIN | 전체 이벤트 목록 | — |
| 149 | `PATCH` | `/admin/events/{id}/hide` | 🔑 ADMIN | 이벤트 숨김 처리 | `404` |
| 150 | `DELETE` | `/admin/events/{id}` | 🔑 ADMIN | 이벤트 삭제 | `404` |

---

## 📌 10. Notice 모듈 (`/api/v1/notices`, `/api/v1/requests`)

### 10-1. 공지사항 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 151 | `GET` | `/notices?type=&targetRole=&page=&size=` | ❌ | 공지 목록 (타입/대상 필터) | — |
| 152 | `GET` | `/notices/{id}` | ❌ | 공지 상세 | `404` |
| 153 | `POST` | `/notices` | 🔑 ADMIN | 공지 작성 | `400` 유효성 |
| 154 | `PUT` | `/notices/{id}` | 🔑 ADMIN | 공지 수정 | `404` |
| 155 | `DELETE` | `/notices/{id}` | 🔑 ADMIN | 공지 삭제 | `404` |
| 156 | `PATCH` | `/notices/{id}/pin` | 🔑 ADMIN | 공지 고정/해제 | `404` |

```
GET /notices Query Parameters:
  type       (string)  — GUIDE, ANNOUNCEMENT, QNA, OBJECTION
  targetRole (string)  — ALL, USER, HOST
  page       (int)     — 페이지 번호
  size       (int)     — 페이지 크기
```

### 10-2. 호스트 요청 게시판 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 157 | `GET` | `/host/requests?category=&status=&page=&size=` | 🔑 HOST | 내 요청 목록 | — |
| 158 | `POST` | `/host/requests` | 🔑 HOST | 요청 작성 | `400` 유효성 |
| 159 | `GET` | `/host/requests/{id}` | 🔑 HOST | 요청 상세 | `403` 타인 요청, `404` |

```json
// POST /host/requests Request
{
  "category": "REVIEW",
  "title": "허위 리뷰 삭제 요청",
  "content": "리뷰 ID 25번이 허위 내용을 포함하고 있습니다.",
  "targetId": 25
}
// category: COMMUNITY, REVIEW, COMMENT
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 1, "category": "REVIEW",
    "title": "허위 리뷰 삭제 요청",
    "status": "PENDING",
    "createdAt": "2026-04-15T10:00:00"
  }
}
```

### 10-3. 커뮤니티 관리자 요청 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 160 | `GET` | `/communities/{id}/requests?page=&size=` | 🔑 USER | 해당 커뮤니티 요청 목록 (관리자만) | `403` 권한 없음 |
| 161 | `PATCH` | `/communities/{id}/requests/{reqId}/approve` | 🔑 USER | 요청 승인 | `403`, `422` 이미 처리 |
| 162 | `PATCH` | `/communities/{id}/requests/{reqId}/reject` | 🔑 USER | 요청 거절 | `403`, `422` 이미 처리 |

---

## 📌 11. 마이페이지 통합 API (`/api/v1/mypage`)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 163 | `GET` | `/mypage/summary` | 🔑 USER | 대시보드 요약 (수강중/완료/찜 수) | — |
| 164 | `GET` | `/mypage/events?tab=ongoing&page=&size=` | 🔑 USER | 수강 중인 강의 목록 | — |
| 165 | `GET` | `/mypage/events?tab=completed&page=&size=` | 🔑 USER | 수강 완료 강의 목록 | — |
| 166 | `GET` | `/mypage/communities?tab=joined&page=&size=` | 🔑 USER | 참여 중인 커뮤니티 | — |
| 167 | `GET` | `/mypage/communities?tab=bookmarked&page=&size=` | 🔑 USER | 북마크한 커뮤니티 | — |
| 168 | `GET` | `/mypage/communities?tab=my-posts&page=&size=` | 🔑 USER | 내가 쓴 게시물 | — |
| 169 | `GET` | `/mypage/communities?tab=bookmarked-posts&page=&size=` | 🔑 USER | 북마크한 게시물 | — |

---

## 📌 12. 파일 업로드 API (`/api/v1/upload`)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 170 | `POST` | `/upload/image` | 🔑 ALL | 이미지 업로드 | `400` 파일 형식/크기 초과 |

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

| 모듈 | # 범위 | API 수 | 주요 기능 |
|------|--------|--------|----------|
| **User** (인증/프로필) | #1~26 | 26개 | 회원가입, 로그인, OAuth2, 프로필, 공개 프로필 |
| **Event** (이벤트) | #27~50 | 24개 | CRUD, 필터/검색, 세션, 🆕패키지, 🆕Draft, 리뷰 |
| **Community** (커뮤니티) | #51~76 | 26개 | CRUD, 🆕커뮤니티 북마크, 멤버 관리, 게시글, 댓글(✅통합) |
| **Payment** (결제) | #77~88 | 12개 | 토스 결제, 🆕Webhook 보안, 환불, 🆕호스트 대시보드 |
| **Wishlist/Cart** (찜/장바구니) | #89~97 | 9개 | 찜, 장바구니 |
| **Badge** (뱃지) | #98~101 | 4개 | 뱃지 조회, 노출 설정, 검색/초대 |
| **Notification** (알림) | #102~105 | 4개 | 알림 5종, 읽음 처리 |
| **Report** (신고) | #106~109 | 4개 | 신고 접수, 이의 제기 |
| **Admin** (관리자) | #110~150 | 41개 | 회원/카테고리/🆕관심카테고리CRUD/신고/환불/커뮤니티/리뷰 |
| **Notice** (공지) | #151~162 | 12개 | 공지사항, 요청 게시판 |
| **Mypage** (마이페이지) | #163~169 | 7개 | 탭별 통합 조회 |
| **Upload** (파일) | #170 | 1개 | 이미지 업로드 |
| **합계** | | **170개** | v5(163개) → v5.1(170개) |

---

## 📌 공통 에러 코드

| HTTP Code | Error Code | 설명 |
|-----------|------------|------|
| `400` | `BAD_REQUEST` | 유효성 검증 실패 (필수값 누락, 형식 오류) |
| `401` | `UNAUTHORIZED` | 인증 실패 (JWT 없음/만료) |
| `402` | `PAYMENT_FAILED` | 토스 결제 실패 |
| `403` | `FORBIDDEN` | 권한 없음 (역할 불일치, 타인 리소스) |
| `404` | `NOT_FOUND` | 리소스 없음 |
| `409` | `CONFLICT` | 중복 (이메일, 리뷰, 찜, 가입 등) |
| `410` | `GONE` | 만료 (인증 코드 만료) |
| `422` | `UNPROCESSABLE` | 비즈니스 규칙 위반 (정지 계정, 정원 초과, 잘못된 상태 전이 등) |
| `429` | `TOO_MANY_REQUESTS` | 요청 제한 초과 (인증 코드 재발송 등) |
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
> 📌 **이전 버전:** [VenueOn_최종_API_스펙_v5.md](./VenueOn_최종_API_스펙_v5.md)  
> 📌 **기반 문서:** [VenueOn_목표_아키텍처_v5.md](./VenueOn_목표_아키텍처_v5.md), [VenueOn_최종_기능_페이지_정의서.md](./VenueOn_최종_기능_페이지_정의서.md)
