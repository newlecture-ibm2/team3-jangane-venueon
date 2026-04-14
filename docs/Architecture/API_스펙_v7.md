# 🔌 VenueOn 최종 API 스펙 v7

> **작성일:** 2026-04-13  
> **규칙:** 모든 백엔드 경로에 `/api` 미포함 (프론트엔드 BFF에서만 `/api/` 접두사 사용)  
> **인증:** JWT Bearer Token (`Authorization: Bearer {token}`)  
> **공통 응답:** `{ "status": "SUCCESS|ERROR", "data": {...}, "message": "..." }`  
> **설계 기반:** 티켓 중심 판매 + 세션 기반 상태 Computed + 코드 테이블 정규화  
> **v7 핵심 변경:** 모든 상태/유형/역할 필드가 `{id, label}` 객체로 응답됨

---

## 📌 v6 → v7 API 응답 변경사항

### 코드 테이블 기반 응답 구조

v6에서 문자열이었던 `status`, `type`, `role` 등이 v7에서는 **ID + label 객체**로 변경됨.

```json
// v6 응답
{ "status": "PUBLISHED", "type": "CLASS", "role": "HOST" }

// v7 응답
{
  "status": { "id": 2, "label": "발행됨" },
  "type": { "id": 1, "label": "클래스" },
  "role": { "id": 3, "label": "호스트" }
}
```

> 프론트엔드에서 상태 비교 시: `event.status.id === 2` (PUBLISHED)  
> 화면 표시 시: `event.status.label` → "발행됨"

### CodeDto 구조

```java
public record CodeDto(Long id, String label) {
    public static CodeDto of(Long id, String label) {
        if (id == null) return null;
        return new CodeDto(id, label);
    }
}
```

### 코드 ID 상수 (프론트엔드 참조)

| 도메인 | code | ID |
|--------|------|----|
| **Event Status** | DRAFT | 1 |
| | PUBLISHED | 2 |
| | ONGOING | 3 |
| | ENDED | 4 |
| | CANCELLED | 5 |
| **User Role** | ADMIN | 1 |
| | USER | 2 |
| | HOST | 3 |
| **Event Type** | CLASS | 1 |
| | SEMINAR | 2 |
| | CONFERENCE | 3 |
| | MEETUP | 4 |
| **Recruitment Status** | PENDING | 1 |
| | OPEN | 2 |
| | CLOSED | 3 |

---

## 📌 상태 전이 규칙

### 이벤트 상태 (`Event.status`)

```
DRAFT(1) → PUBLISHED(2) → ONGOING(3) → ENDED(4)
  │              │
  │              └→ CANCELLED(5)
  └→ (삭제)
```

| 전이 | 조건 |
|------|------|
| DRAFT → PUBLISHED | 호스트가 게시 버튼 클릭 |
| PUBLISHED → ONGOING | 세션 startTime 도래 (Computed) |
| ONGOING → ENDED | 모든 세션 endTime 경과 (Computed) or 호스트 수동 |
| PUBLISHED/ONGOING → CANCELLED | 호스트 취소 |

> ONGOING, ENDED는 DB에 직접 저장하지 않고 세션의 startTime/endTime 기반 조회 시 계산 (수동 ENDED 제외).  
> **단, 호스트가 수동으로 세션 상태를 강제 지정 시 `forced_session_status_id`에 저장.**

### 모집 상태 (`RecruitmentStatus` — Computed + 강제 상태)

```
세션별: 강제상태(forced) > 수동 마감 > 정원 초과 > 날짜 기반 > 기본(OPEN)
이벤트: 1개라도 OPEN → OPEN / 모두 PENDING → PENDING / 모두 CLOSED → CLOSED
```

> **v7 변경:** 호스트가 `PATCH /host/events/{id}/sessions/{sid}/recruitment` 로 상태를 강제 지정하면  
> `forced_recruitment_status_id`에 해당 상태 ID가 저장되며, Computed 결과보다 우선함.  
> `statusId: null` 전송 시 → 강제 해제 → 자동 모드로 복귀.

### 주문 상태 (`Order.status`) — v6과 동일

```
PENDING → PAID → REGISTERED → COMPLETED
  │         │
  └→ CANCELLED  └→ REFUND_REQUESTED → REFUNDED
```

### 신고 처리 단계 (`Report.status`) — v6과 동일

```
RECEIVED → REVIEWING → ACTIONED → COMPLETED
                │
                └→ REJECTED
```

---

## 📌 1. User 모듈 (`/auth`, `/users`)

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
| 11 | `GET` | `/auth/me` | 🔑 ALL | 현재 로그인 사용자 정보 | — |

#### 상세: `POST /auth/login` 응답 (v7 변경)

```json
{
  "token": "eyJhbGci...",
  "email": "user1@example.com",
  "nickname": "김참여",
  "role": { "id": 2, "label": "일반사용자" }
}
```

### 1-2. 호스트 인증 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 12 | `POST` | `/auth/host/signup` | ❌ | 호스트 회원가입 | `400`, `409` |
| 13 | `POST` | `/auth/host/signup/verify` | ❌ | 호스트 이메일 인증 | `400` |
| 14 | `POST` | `/auth/host/login` | ❌ | 호스트 로그인 | `401` |
| 15 | `POST` | `/auth/host/upgrade` | 🔑 USER | 일반 → 호스트 전환 | `400`, `409` |

### 1-3. 사용자 프로필 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 16 | `GET` | `/users/me` | 🔑 ALL | 내 프로필 조회 | — |
| 17 | `PUT` | `/users/me/profile` | 🔑 ALL | 프로필 수정 | `400` |
| 18 | `PUT` | `/users/me/password` | 🔑 ALL | 비밀번호 변경 | `400` |
| 19 | `POST` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 업로드 | `400` |
| 20 | `DELETE` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 삭제 | — |
| 21 | `DELETE` | `/users/me` | 🔑 ALL | 회원 탈퇴 | `400` |

### 1-4. 관심 카테고리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 22 | `GET` | `/users/me/interest-categories` | 🔑 USER | 내 관심 카테고리 목록 | — |
| 23 | `PUT` | `/users/me/interest-categories` | 🔑 USER | 관심 카테고리 등록/수정 | `400` |

### 1-5. 사용자 공개 프로필 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 24 | `GET` | `/users/{userId}/profile` | ❌ | 공개 프로필 조회 | `404` |
| 25 | `GET` | `/users/{userId}/posts?page=&size=` | ❌ | 작성한 글 목록 | `404` |
| 26 | `GET` | `/users/{userId}/comments?page=&size=` | ❌ | 작성한 댓글 목록 | `404` |
| 27 | `GET` | `/users/{userId}/reviews?page=&size=` | ❌ | 작성한 리뷰 목록 | `404` |
| 28 | `GET` | `/users/{userId}/communities?page=&size=` | ❌ | 참여 커뮤니티 목록 | `404` |

---

## 📌 2. Event 모듈 (`/events`)

### 2-1. 이벤트 목록/검색 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 29 | `GET` | `/events` | ❌ | 이벤트 목록 (필터 + 페이지네이션) | — |
| 30 | `GET` | `/events/recommended` | 🔑 USER | 관심 카테고리 기반 추천 | — |
| 31 | `GET` | `/events/popular` | ❌ | 인기 이벤트 | — |

#### 응답 예시 (v7 — 코드 객체 응답)

```json
{
  "status": "SUCCESS",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Spring Boot 마스터 클래스",
        "thumbnailUrl": "/upload/event/1.jpg",
        "type": { "id": 1, "label": "클래스" },
        "status": { "id": 2, "label": "발행됨" },
        "recruitmentStatus": { "id": 2, "label": "모집중" },
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
| 32 | `GET` | `/events/{id}` | ❌ | 이벤트 상세 (세션 + 티켓 + 리뷰) | `404` |

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "title": "AI Summit 2026",
    "description": "<p>Rich Editor HTML</p>",
    "type": { "id": 3, "label": "컨퍼런스" },
    "status": { "id": 3, "label": "진행중" },
    "recruitmentStatus": { "id": 2, "label": "모집중" },
    "thumbnailUrl": "/upload/event/1.jpg",
    "hasSession": true,
    "startDate": "2026-05-01T10:00:00",
    "endDate": "2026-05-03T18:00:00",
    "category": { "id": 1, "name": "기술" },
    "creator": { "id": 2, "nickname": "테크캠프", "profileImg": "..." },
    "sessions": [
      {
        "id": 1, "title": "Day 1: 기초 강연",
        "description": "AI 기초",
        "sortOrder": 1,
        "startTime": "2026-05-01T10:00:00",
        "endTime": "2026-05-01T18:00:00",
        "location": "서울 강남구",
        "regionSido": "서울", "regionSigungu": "강남구",
        "addressRoad": "서울 강남구 테헤란로 123",
        "addressDetail": "3층 세미나실",
        "isOnline": false, "onlineLink": null,
        "maxAttendees": 100, "currentAttendees": 45,
        "sessionStatus": { "id": 2, "label": "발행됨" },
        "recruitmentStatus": { "id": 2, "label": "모집중" },
        "forcedSessionStatus": null,
        "forcedRecruitmentStatus": null,
        "recruitStartDate": "2026-04-01T00:00:00",
        "recruitEndDate": "2026-04-30T23:59:59",
        "isRecruitmentClosed": false
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
        "sessions": ["Day 1", "Day 2", "Day 3"]
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 8,
    "isWishlisted": false,
    "createdAt": "2026-04-01T09:00:00"
  }
}
```

### 2-3. 호스트 이벤트 CRUD API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 33 | `POST` | `/host/events` | 🔑 HOST | 이벤트 생성 | `400` |
| 34 | `PUT` | `/host/events/{id}` | 🔑 HOST | 이벤트 수정 | `403`, `404` |
| 35 | `DELETE` | `/host/events/{id}` | 🔑 HOST | 이벤트 삭제 | `403`, `422` 수강생 존재 |
| 36 | `PATCH` | `/host/events/{id}/status` | 🔑 HOST | 상태 변경 (statusId 기반) | `403`, `422` 잘못된 전이 |
| 37 | `POST` | `/host/events/{id}/thumbnail` | 🔑 HOST | 썸네일 업로드 | `400` |

#### 상세: `PATCH /host/events/{id}/status` (v7 변경)

```json
// Request — ID 기반
{ "status": 2 }
// status: 2 = PUBLISHED, 4 = ENDED, 5 = CANCELLED
```

### 2-4. 세션 조회 API (공개)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 38 | `GET` | `/events/{eventId}/sessions` | ❌ | 세션 목록 | `404` |

### 2-5. 호스트 세션 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 39 | `POST` | `/host/events/{eventId}/sessions` | 🔑 HOST | 세션 추가 | `403` |
| 40 | `PUT` | `/host/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 수정 | `403`, `404` |
| 41 | `DELETE` | `/host/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 삭제 | `403`, `404` |
| 42 | `PATCH` | `/host/events/{eventId}/sessions/reorder` | 🔑 HOST | 세션 순서 변경 | `403` |

### 2-6. 호스트 세션 상태 관리 API (v7 변경)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 43 | `PATCH` | `/host/events/{eventId}/sessions/{sessionId}/recruitment` | 🔑 HOST | 세션별 모집 상태 강제 지정 | `403`, `404` |
| 44 | `PATCH` | `/host/events/{eventId}/sessions/{sessionId}/status` | 🔑 HOST | 세션별 진행 상태 강제 지정 | `403`, `404` |

```json
// PATCH Request — statusId 기반
{ "statusId": 3 }
// statusId: null → 자동 모드로 복귀 (강제 해제)
// statusId: 2 → OPEN 강제 / statusId: 3 → CLOSED 강제 (모집)
// statusId: 3 → ONGOING 강제 / statusId: 4 → ENDED 강제 (진행)
```

### 2-7. 티켓 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 45 | `GET` | `/events/{eventId}/tickets` | ❌ | 이벤트 티켓 목록 | `404` |
| 46 | `POST` | `/host/events/{eventId}/tickets` | 🔑 HOST | 티켓 생성 | `403`, `400` |
| 47 | `PUT` | `/host/tickets/{ticketId}` | 🔑 HOST | 티켓 수정 | `403`, `404` |
| 48 | `DELETE` | `/host/tickets/{ticketId}` | 🔑 HOST | 티켓 삭제 | `403`, `422` 판매된 티켓 |

### 2-8. 호스트 이벤트 조회 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 49 | `GET` | `/host/events?status=&page=&size=` | 🔑 HOST | 내 이벤트 목록 | — |
| 50 | `GET` | `/host/events/drafts?page=&size=` | 🔑 HOST | 임시저장 목록 | — |
| 51 | `GET` | `/host/events/{id}/attendees?page=&size=` | 🔑 HOST | 수강생 목록 | `403` |

### 2-9. 리뷰 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 52 | `GET` | `/events/{eventId}/reviews?page=&size=` | ❌ | 리뷰 목록 | `404` |
| 53 | `POST` | `/events/{eventId}/reviews` | 🔑 USER | 리뷰 작성 (1인 1리뷰) | `403` 미수강, `409` 중복 |
| 54 | `PUT` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 리뷰 수정 | `403` |
| 55 | `DELETE` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 리뷰 삭제 | `403` |

### 2-10. 카테고리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 56 | `GET` | `/categories` | ❌ | 전체 카테고리 목록 | — |

#### 응답 예시

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "기술", "description": "...", "sortOrder": 0, "eventCount": 5 },
    { "id": 2, "name": "비즈니스", "description": "...", "sortOrder": 1, "eventCount": 3 }
  ]
}
```

---

## 📌 3~12. 나머지 모듈

Community (#57~82), Order (#83~94), Wishlist/Cart (#95~103), Badge (#104~107), Notification (#108~111), Report (#112~115), Admin (#116~156), Notice (#157~168), Mypage (#169~175), Upload (#176) 모듈의 경우 **API 경로와 요청/응답 구조는 기본적으로 v6과 동일**합니다. 
(단, 기존 `/admin/communities` 하위에 있던 일부 커뮤니티 전용 관리 기능은 `/manager/communities` 하위로 분리되었습니다.)

단, 모든 응답에서 상태/유형/역할 관련 필드는 `{id, label}` 객체로 반환됨에 주의합니다.

---

## 📌 전체 API 요약

| 모듈 | # 범위 | API 수 | 주요 기능 |
|------|--------|--------|----------|
| **User** (인증/프로필) | #1~28 | 28개 | 회원가입, 로그인, OAuth2, 프로필, **호스트 전환**, 공개 프로필 |
| **Event** (이벤트/세션/티켓) | #29~56 | 28개 | CRUD, 필터, 세션, 티켓 CRUD, 리뷰, **ID 기반 상태 관리** |
| **Community** (커뮤니티) | #57~82 | 26개 | 커뮤니티 CRUD, 북마크, 멤버, 게시글, 댓글 |
| **Order** (결제) | #83~94 | 12개 | ticketId 기반 주문, 토스, 환불, 호스트 대시보드 |
| **Wishlist/Cart** | #95~103 | 9개 | 찜, 티켓 기반 장바구니 |
| **Badge** (뱃지) | #104~107 | 4개 | 뱃지 조회, 검색/초대 |
| **Notification** (알림) | #108~111 | 4개 | 알림 5종, 읽음 |
| **Report** (신고) | #112~115 | 4개 | 신고, 이의 제기 |
| **Admin** (관리자) | #116~156 | 41개 | 사이트 전체 관리 |
| **Manager** (매니저) | (에 포함) | - | 커뮤니티 내부 한정 관리 (`/manager/...`) |
| **Notice** (공지) | #157~168 | 12개 | 공지, 요청 게시판 |
| **Mypage** | #169~175 | 7개 | 탭별 통합 조회 |
| **Upload** | #176 | 1개 | 이미지 업로드 |
| **합계** | | **176개** | |

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
