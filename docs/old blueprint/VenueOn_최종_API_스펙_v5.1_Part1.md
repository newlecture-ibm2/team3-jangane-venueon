# 🔌 VenueOn 최종 목표 API 스펙 v5.1

> **작성일:** 2026-04-02  
> **기반:** 목표 아키텍처 v5 + 최종 기능·페이지 정의서 v2  
> **이전 버전:** VenueOn_최종_API_스펙_v5.md  
> **Base URL:** `/api/v1`  
> **인증:** JWT Bearer Token (`Authorization: Bearer {token}`)  
> **공통 응답:** `{ "status": "SUCCESS|ERROR", "data": {...}, "message": "..." }`

### v5 → v5.1 변경 요약

| 구분 | v5 | v5.1 |
|------|-----|------|
| 총 API 수 | 163개 | **170개** (+7) |
| #69/#70 댓글 중복 | 2개 분리 | ✅ 1개로 통합 |
| 커뮤니티 북마크 API | ❌ 누락 | ✅ 추가 |
| 호스트 대시보드 API | ❌ 누락 | ✅ 추가 |
| Draft 목록 조회 | ❌ 불명확 | ✅ 명시 |
| 관심 카테고리 어드민 CRUD | GET 2개만 | ✅ CRUD 완성 (+3) |
| 패키지 강의 관리 | ❌ 누락 | ✅ 조회/해제 추가 (+2) |
| 페이지네이션 | 일부 누락 | ✅ 모든 목록 API 적용 |
| 경로 네이밍 | 불일치 | ✅ 패턴 통일 |
| 상태 전이 규칙 | ❌ 없음 | ✅ 다이어그램 추가 |
| Webhook 보안 | ❌ 미기재 | ✅ 서명 검증 설명 추가 |
| 에러 코드 | 일부만 | ✅ 전체 API 보완 |

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
| PUBLISHED → ONGOING | startDate 도달 (자동) |
| ONGOING → ENDED | endDate 도달 (자동) |
| PUBLISHED → CANCELLED | 호스트 취소 (수강생 있으면 환불 처리 필요) |

### 주문 상태 (`Order.status`)

```
PENDING → PAID → REGISTERED → COMPLETED
  │         │
  └→ CANCELLED  └→ REFUNDED
```

| 전이 | 조건 |
|------|------|
| PENDING → PAID | 토스 결제 승인 완료 |
| PAID → REGISTERED | 수강 확인 (이벤트 시작) |
| REGISTERED → COMPLETED | 이벤트 종료 → 뱃지 자동 발급 |
| PENDING → CANCELLED | 결제 시간 초과 또는 사용자 취소 |
| PAID → REFUNDED | 환불 승인 완료 |

### 신고 처리 단계 (`Report.status`)

```
RECEIVED → REVIEWING → ACTIONED → COMPLETED
                │
                └→ REJECTED (반려)
```

---

## 📌 1. User 모듈 (`/api/v1/auth`, `/api/v1/users`)

### 1-1. 인증 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 1 | `POST` | `/auth/signup` | ❌ | 이메일 회원가입 | `400` 유효성, `409` 이메일 중복 |
| 2 | `POST` | `/auth/signup/verify` | ❌ | 이메일 인증 코드 검증 | `400` 잘못된 코드, `410` 만료 |
| 3 | `POST` | `/auth/signup/resend` | ❌ | 인증 코드 재발송 | `404` 미등록 이메일, `429` 재발송 제한 |
| 4 | `POST` | `/auth/login` | ❌ | 이메일/비밀번호 로그인 → JWT 발급 | `401` 불일치, `403` 정지 계정, `422` 이메일 미인증 |
| 5 | `POST` | `/auth/logout` | 🔑 ALL | 로그아웃 (Redis 블랙리스트) | — |
| 6 | `POST` | `/auth/refresh` | ❌ | Refresh Token → Access Token 재발급 | `401` 만료/무효 토큰 |
| 7 | `POST` | `/auth/forgot-password` | ❌ | 임시 비밀번호 이메일 발송 | `404` 미등록 이메일 |
| 8 | `GET` | `/auth/check-email?email=` | ❌ | 이메일 중복 확인 | — |
| 9 | `GET` | `/auth/oauth2/google` | ❌ | Google OAuth2 로그인 리다이렉트 | — |
| 10 | `GET` | `/auth/oauth2/google/callback` | ❌ | Google OAuth2 콜백 → JWT 발급 | `401` OAuth 실패 |

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
```

#### 상세: `POST /auth/login`

```json
// Request
{ "email": "user@example.com", "password": "Password1!" }
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
```

### 1-2. 호스트 인증 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 11 | `POST` | `/auth/host/signup` | ❌ | 호스트 회원가입 (사업자등록번호 포함) | `400` 유효성, `409` 중복 |
| 12 | `POST` | `/auth/host/signup/verify` | ❌ | 호스트 이메일 인증 코드 검증 | `400` 잘못된 코드 |
| 13 | `POST` | `/auth/host/login` | ❌ | 호스트 로그인 | `401` 불일치 |

### 1-3. 사용자 프로필 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 14 | `GET` | `/users/me` | 🔑 ALL | 내 프로필 조회 | — |
| 15 | `PUT` | `/users/me` | 🔑 ALL | 프로필 수정 (닉네임) | `400` 유효성 |
| 16 | `PUT` | `/users/me/password` | 🔑 ALL | 비밀번호 변경 | `400` 현재 비밀번호 불일치 |
| 17 | `POST` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 업로드 | `400` 파일 형식/크기 |
| 18 | `DELETE` | `/users/me/profile-image` | 🔑 ALL | 프로필 사진 삭제 | — |
| 19 | `DELETE` | `/users/me` | 🔑 ALL | 회원 탈퇴 | `400` 비밀번호 확인 실패 |

### 1-4. 관심 카테고리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 20 | `GET` | `/users/me/interest-categories` | 🔑 USER | 내 관심 카테고리 목록 조회 | — |
| 21 | `PUT` | `/users/me/interest-categories` | 🔑 USER | 관심 카테고리 등록/수정 (복수 선택) | `400` 유효하지 않은 카테고리 ID |

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

> **인증 참고:** 비인증 요청도 가능하지만, 서버에서 `is_hidden=true`인 콘텐츠와 비공개 뱃지(`is_visible=false`)는 자동으로 필터링하여 반환합니다.

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 22 | `GET` | `/users/{userId}/profile` | ❌ | 사용자 공개 프로필 조회 | `404` 사용자 없음 |
| 23 | `GET` | `/users/{userId}/posts?page=&size=` | ❌ | 작성한 글 목록 (공개 커뮤니티만) | `404` |
| 24 | `GET` | `/users/{userId}/comments?page=&size=` | ❌ | 작성한 댓글 목록 (공개 커뮤니티만) | `404` |
| 25 | `GET` | `/users/{userId}/reviews?page=&size=` | ❌ | 작성한 리뷰 목록 | `404` |
| 26 | `GET` | `/users/{userId}/communities?page=&size=` | ❌ | 참여 중인 공개 커뮤니티 목록 | `404` |

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
      "postCount": 12, "commentCount": 45,
      "reviewCount": 3, "badgeCount": 5
    }
  }
}
```

---

## 📌 2. Event 모듈 (`/api/v1/events`)

### 2-1. 이벤트 목록/검색 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 27 | `GET` | `/events` | ❌ | 이벤트 목록 (필터 + 페이지네이션) | — |
| 28 | `GET` | `/events/recommended` | 🔑 USER | 관심 카테고리 기반 추천 이벤트 | — |
| 29 | `GET` | `/events/popular` | ❌ | 인기 이벤트 (조회수/참여순) | — |

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
        "type": "CLASS", "status": "PUBLISHED",
        "location": "서울 강남구",
        "regionSido": "서울",
        "isOnline": false,
        "price": 50000, "discountRate": 20, "discountedPrice": 40000,
        "startDate": "2026-05-01T10:00:00",
        "endDate": "2026-05-01T18:00:00",
        "maxAttendees": 30, "currentAttendees": 12,
        "averageRating": 4.5, "reviewCount": 8,
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
| 30 | `GET` | `/events/{id}` | ❌ | 이벤트 상세 (세션, 할인, 리뷰 포함) | `404` 이벤트 없음 |

```json
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "title": "Spring Boot 마스터 클래스",
    "description": "<p>Rich Editor HTML 콘텐츠</p>",
    "thumbnailUrl": "/upload/event/1.jpg",
    "type": "CLASS", "status": "PUBLISHED",
    "location": "서울 강남구 삼성동",
    "regionSido": "서울", "regionSigungu": "강남구",
    "isOnline": false, "sessionLink": null,
    "price": 50000,
    "discountRate": 20, "discountedPrice": 40000,
    "discountStart": "2026-04-20T00:00:00",
    "discountEnd": "2026-04-30T23:59:59",
    "maxAttendees": 30, "currentAttendees": 12,
    "startDate": "2026-05-01T10:00:00",
    "endDate": "2026-05-01T18:00:00",
    "category": { "id": 1, "name": "프로그래밍" },
    "creator": { "id": 2, "nickname": "테크캠프", "profileImg": "..." },
    "sessions": [
      { "id": 1, "title": "오리엔테이션", "description": "소개", "sortOrder": 1, "startTime": "10:00", "endTime": "11:00" },
      { "id": 2, "title": "Spring Core", "description": "핵심 개념", "sortOrder": 2, "startTime": "11:00", "endTime": "13:00" }
    ],
    "packageEvents": [
      { "id": 3, "title": "Spring JPA 심화" },
      { "id": 5, "title": "Spring Security 실전" }
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
| 31 | `POST` | `/events` | 🔑 HOST | 이벤트 생성 (Step 1~4 통합) | `400` 유효성 |
| 32 | `PUT` | `/events/{id}` | 🔑 HOST | 이벤트 수정 (본인만) | `403` 타인 이벤트, `404` |
| 33 | `DELETE` | `/events/{id}` | 🔑 HOST | 이벤트 삭제 (본인만) | `403`, `422` 수강생 존재 |
| 34 | `PATCH` | `/events/{id}/status` | 🔑 HOST | 상태 변경 (상태 전이 규칙 참고) | `403`, `422` 잘못된 전이 |
| 35 | `POST` | `/events/{id}/thumbnail` | 🔑 HOST | 썸네일 이미지 업로드 | `400` 파일 형식 |

#### 상세: `POST /events`

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
    { "title": "오리엔테이션", "description": "소개", "sortOrder": 1, "startTime": "10:00", "endTime": "11:00" }
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

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 36 | `GET` | `/events/{eventId}/sessions` | ❌ | 세션 목록 조회 | `404` |
| 37 | `POST` | `/events/{eventId}/sessions` | 🔑 HOST | 세션 추가 | `403` 타인 이벤트 |
| 38 | `PUT` | `/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 수정 | `403`, `404` |
| 39 | `DELETE` | `/events/{eventId}/sessions/{sessionId}` | 🔑 HOST | 세션 삭제 | `403`, `404` |
| 40 | `PATCH` | `/events/{eventId}/sessions/reorder` | 🔑 HOST | 세션 순서 변경 | `403` |

### 2-5. 패키지 강의 관리 API (🆕 v5.1)

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 41 | `GET` | `/events/{eventId}/packages` | ❌ | 패키지로 묶인 강의 목록 조회 | `404` |
| 42 | `PUT` | `/events/{eventId}/packages` | 🔑 HOST | 패키지 강의 설정/변경 (본인 이벤트만) | `403`, `400` 유효하지 않은 이벤트 ID |

```json
// PUT /events/{eventId}/packages Request
{ "packageEventIds": [3, 5, 8] }
// Response 200
{
  "status": "SUCCESS",
  "data": [
    { "id": 3, "title": "Spring JPA 심화" },
    { "id": 5, "title": "Spring Security 실전" },
    { "id": 8, "title": "Spring Cloud 입문" }
  ]
}
```

### 2-6. 호스트 이벤트 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 43 | `GET` | `/host/events?status=&page=&size=` | 🔑 HOST | 내 이벤트 목록 (상태별 필터 + 페이지네이션) | — |
| 44 | `GET` | `/host/events/drafts?page=&size=` | 🔑 HOST | 🆕 임시 저장(DRAFT) 이벤트 목록 | — |
| 45 | `GET` | `/host/events/{id}/attendees?page=&size=` | 🔑 HOST | 이벤트 수강생 목록 | `403` 타인 이벤트 |

### 2-7. 리뷰 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 46 | `GET` | `/events/{eventId}/reviews?page=&size=` | ❌ | 리뷰 목록 (페이지네이션) | `404` |
| 47 | `POST` | `/events/{eventId}/reviews` | 🔑 USER | 리뷰 작성 (수강 완료자, 1인 1리뷰) | `403` 미수강, `409` 중복 |
| 48 | `PUT` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 내 리뷰 수정 | `403` 타인 리뷰 |
| 49 | `DELETE` | `/events/{eventId}/reviews/{reviewId}` | 🔑 USER | 내 리뷰 삭제 | `403` |

```json
// POST /events/{eventId}/reviews Request
{ "rating": 5, "content": "정말 유익한 강의였습니다!" }
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 1, "rating": 5, "content": "정말 유익한 강의였습니다!",
    "user": { "id": 1, "nickname": "홍길동" },
    "createdAt": "2026-05-02T10:00:00"
  }
}
```

### 2-8. 카테고리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 50 | `GET` | `/categories` | ❌ | 전체 카테고리 목록 조회 | — |

---

## 📌 3. Community 모듈 (`/api/v1/communities`)

### 3-1. 커뮤니티 CRUD API

> **인증 참고:** `GET /communities`는 비인증도 가능하지만, 로그인 시 비공개 커뮤니티 중 본인이 가입한 커뮤니티가 추가로 노출됩니다.

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 51 | `GET` | `/communities?isPublic=&page=&size=` | ❌/🔑 | 커뮤니티 목록 (공개/비공개 필터) | — |
| 52 | `GET` | `/communities/{id}` | 🔑 ALL | 커뮤니티 상세 조회 | `403` 비공개+미가입, `404` |
| 53 | `POST` | `/communities` | 🔑 USER | 커뮤니티 생성 요청 (어드민 승인 필요) | `400` 유효성 |
| 54 | `PUT` | `/communities/{id}` | 🔑 USER | 커뮤니티 수정 (커뮤니티 관리자만) | `403` 권한 없음 |
| 55 | `DELETE` | `/communities/{id}` | 🔑 ADMIN | 커뮤니티 삭제 | `404` |
| 56 | `GET` | `/communities/recommended` | 🔑 USER | 뱃지 기반 추천 커뮤니티 | — |
| 57 | `POST` | `/communities/{id}/bookmark` | 🔑 USER | 🆕 커뮤니티 북마크 토글 | `404` |

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

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 58 | `GET` | `/communities/{id}/members?role=&keyword=&page=&size=` | 🔑 ALL | 멤버 목록 (역할별/이름 검색) | `403` 비공개+미가입 |
| 59 | `POST` | `/communities/{id}/join` | 🔑 USER | 커뮤니티 가입 | `403` 뱃지 미보유, `409` 이미 가입 |
| 60 | `DELETE` | `/communities/{id}/leave` | 🔑 USER | 커뮤니티 탈퇴 | `422` 관리자 탈퇴 불가 |
| 61 | `PATCH` | `/communities/{id}/members/{userId}/role` | 🔑 USER | 멤버 권한 변경 (관리자만) | `403` 권한 없음 |

```json
// PATCH Request — 권한 변경
{ "role": "SUB_ADMIN" }
// role: ADMIN, SUB_ADMIN, READ_WRITE, READ_ONLY, BLOCKED
```

### 3-3. 게시글 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 62 | `GET` | `/communities/{id}/posts?type=&keyword=&page=&size=` | 🔑 ALL | 게시글 목록 (타입 필터 + 검색) | `403` 권한 |
| 63 | `GET` | `/communities/{id}/posts/popular?page=&size=` | 🔑 ALL | 인기글 목록 | `403` |
| 64 | `GET` | `/communities/{id}/posts/pinned` | 🔑 ALL | 공지/고정 게시글 | `403` |
| 65 | `POST` | `/communities/{id}/posts` | 🔑 USER | 게시글 작성 (Rich Editor) | `403` READ_ONLY/BLOCKED |
| 66 | `GET` | `/communities/{id}/posts/{postId}` | 🔑 ALL | 게시글 상세 조회 | `404` |
| 67 | `PUT` | `/communities/{id}/posts/{postId}` | 🔑 USER | 게시글 수정 (본인만) | `403` 타인 게시글 |
| 68 | `DELETE` | `/communities/{id}/posts/{postId}` | 🔑 USER | 게시글 삭제 (본인/관리자) | `403` |
| 69 | `PATCH` | `/communities/{id}/posts/{postId}/pin` | 🔑 USER | 게시글 상단 고정 (관리자만) | `403` |
| 70 | `POST` | `/communities/{id}/posts/{postId}/like` | 🔑 USER | 게시글 좋아요 토글 | `403` |
| 71 | `POST` | `/communities/{id}/posts/{postId}/bookmark` | 🔑 USER | 게시글 북마크 토글 | `403` |

### 3-4. 댓글 API (✅ v5.1 수정: #69/#70 통합)

> **v5.1 변경:** v5에서 댓글(#69)과 대댓글(#70)이 별도 항목이었으나, 동일 엔드포인트이므로 1개로 통합. `parentId`가 `null`이면 일반 댓글, 값이 있으면 대댓글.

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 72 | `GET` | `/posts/{postId}/comments` | 🔑 ALL | 댓글 목록 (대댓글 트리 구조) | `404` 게시글 없음 |
| 73 | `POST` | `/posts/{postId}/comments` | 🔑 USER | 댓글/대댓글 작성 (parentId로 구분) | `403` BLOCKED, `404` |
| 74 | `PUT` | `/comments/{commentId}` | 🔑 USER | 댓글 수정 (본인만) | `403` 타인 댓글 |
| 75 | `DELETE` | `/comments/{commentId}` | 🔑 USER | 댓글 삭제 (본인/관리자) | `403` |
| 76 | `POST` | `/comments/{commentId}/like` | 🔑 USER | 댓글 좋아요 토글 | — |

```json
// POST /posts/{postId}/comments Request
// 일반 댓글
{ "content": "좋은 글 감사합니다!", "parentId": null }
// 대댓글
{ "content": "저도 동의합니다!", "parentId": 5 }
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "id": 10, "content": "저도 동의합니다!",
    "parentId": 5,
    "author": { "id": 1, "nickname": "홍길동" },
    "likeCount": 0, "createdAt": "2026-04-15T14:30:00"
  }
}
```

---

## 📌 4. Payment 모듈 (`/api/v1/orders`)

### 4-1. 주문/결제 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 77 | `POST` | `/orders` | 🔑 USER | 단건 주문 생성 (PENDING 상태) | `404` 이벤트 없음, `409` 이미 수강 중, `422` 정원 초과 |
| 78 | `POST` | `/orders/checkout` | 🔑 USER | 장바구니 일괄 주문 생성 | `400` 빈 장바구니 |
| 79 | `POST` | `/orders/{id}/confirm` | 🔑 USER | 토스 결제 승인 요청 | `400` 금액 불일치, `402` 토스 결제 실패 |
| 80 | `POST` | `/orders/toss/webhook` | ❌ (서버) | 토스 Webhook 결제 검증 | — |
| 81 | `GET` | `/orders/{id}` | 🔑 USER | 주문 상세 조회 | `403` 타인 주문, `404` |
| 82 | `GET` | `/orders/me?page=&size=` | 🔑 USER | 내 주문/결제 내역 | — |

#### 상세: `POST /orders`

```json
// Request
{ "eventId": 1, "quantity": 1, "paymentMethod": "CARD" }
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

#### 상세: `POST /orders/{id}/confirm`

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
    "orderId": 100, "status": "PAID",
    "amount": 40000, "paymentMethod": "CARD",
    "paidAt": "2026-04-15T14:30:00"
  }
}
```

#### 🆕 토스 Webhook 보안 (v5.1 추가)

> `POST /orders/toss/webhook`은 비인증 엔드포인트이지만, 다음과 같은 보안 검증을 수행합니다:
> 1. **서명 검증:** 요청 헤더의 `Toss-Signature` 값을 `TOSS_SECRET_KEY`로 HMAC-SHA256 검증
> 2. **금액 일치 검증:** DB에 저장된 주문 금액과 Webhook 전달 금액 비교
> 3. **중복 처리 방지:** 동일 `paymentKey`에 대한 중복 Webhook 호출 무시 (멱등성)

### 4-2. 환불 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 83 | `POST` | `/orders/{orderId}/refund` | 🔑 USER | 환불 요청 | `404`, `422` 이미 환불됨 |
| 84 | `GET` | `/users/me/refunds?page=&size=` | 🔑 USER | 내 환불 내역 | — |

```json
// POST /orders/{orderId}/refund Request
{ "reason": "일정이 변경되어 참석이 어렵습니다." }
// Response 201
{
  "status": "SUCCESS",
  "data": {
    "refundId": 1, "orderId": 100, "amount": 40000,
    "status": "PENDING", "reason": "일정이 변경되어 참석이 어렵습니다.",
    "requestedAt": "2026-04-16T10:00:00"
  }
}
```

### 4-3. 호스트 결제/환불 관리 API

| # | Method | Path | Auth | 설명 | 에러 |
|---|--------|------|------|------|------|
| 85 | `GET` | `/host/dashboard` | 🔑 HOST | 🆕 호스트 대시보드 요약 | — |
| 86 | `GET` | `/host/payments?eventId=&page=&size=` | 🔑 HOST | 내 이벤트 결제 내역 (이벤트별 필터) | — |
| 87 | `POST` | `/host/orders/{orderId}/refund` | 🔑 HOST | 호스트 직접 환불 처리 | `403` 타인 이벤트, `422` 이미 환불 |
| 88 | `GET` | `/host/refunds?page=&size=` | 🔑 HOST | 호스트 환불 이력 | — |

#### 🆕 상세: `GET /host/dashboard`

```json
// Response 200
{
  "status": "SUCCESS",
  "data": {
    "totalEvents": 12,
    "publishedEvents": 8,
    "draftEvents": 2,
    "totalRevenue": 5600000,
    "monthlyRevenue": 1200000,
    "totalAttendees": 245,
    "pendingRefunds": 2,
    "recentOrders": [
      { "orderId": 100, "eventTitle": "Spring Boot 마스터 클래스", "amount": 40000, "orderedAt": "2026-04-15T14:30:00" }
    ]
  }
}
```
