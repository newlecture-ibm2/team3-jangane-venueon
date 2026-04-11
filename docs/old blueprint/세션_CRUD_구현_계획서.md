# 📋 이벤트 세션 CRUD 구현 계획서

> **작성일:** 2026-04-08  
> **기반:** 현재 코드베이스 분석 + ERD v3 + API 스펙 v5.1  
> **목표:** 세션을 이벤트의 핵심 구매 단위로 격상하는 설계 및 구현  
> **향후 확장:** 세션 패키지(묶음 상품) 기능까지 고려한 구조 설계

---

## 📌 목차

1. [현재 상태 분석](#1-현재-상태-분석)
2. [핵심 설계 원칙](#2-핵심-설계-원칙)
3. [확정된 설계 결정](#3-확정된-설계-결정)
4. [DB 스키마 변경](#4-db-스키마-변경)
5. [백엔드 구현 계획](#5-백엔드-구현-계획)
6. [프론트엔드 구현 계획](#6-프론트엔드-구현-계획)
7. [향후 패키지 기능 설계](#7-향후-패키지-기능-설계)
8. [구현 로드맵](#8-구현-로드맵)
9. [검증 체크리스트](#9-검증-체크리스트)

---

## 1. 현재 상태 분석

### 이미 존재하는 것

| 항목 | 상태 | 위치 |
|------|------|------|
| ERD `EVENT_SESSION` 테이블 설계 | ✅ 문서화됨 | `docs/ERD_설계서_v3.md` |
| API 스펙 (#36~#40) 세션 CRUD | ✅ 문서화됨 | `docs/VenueOn_최종_API_스펙_v5.1.md` |
| Event 도메인 모델 (순수 POJO) | ✅ 구현됨 | `event/domain/model/Event.java` |
| Event JPA Entity | ✅ 구현됨 | `event/adapter/out/persistence/entity/EventJpaEntity.java` |
| Event CRUD (Host Controller) | ✅ 구현됨 | `event/presentation/HostEventController.java` |
| Event 생성/수정 DTO | ✅ 구현됨 | `event/adapter/in/web/dto/EventCreateRequest.java` |
| EventForm (Frontend) | ✅ 구현됨 | `frontend/src/app/events/new/_components/EventForm.tsx` |
| Order 도메인 모델 | ✅ 구현됨 | `order/domain/model/Order.java` |

### 아직 없는 것 (이번에 구현)

| 항목 | 비고 |
|------|------|
| `EventSession` 도메인 모델 | 순수 POJO |
| `EventSessionJpaEntity` | JPA 매핑 |
| Session CRUD API 전체 (Controller → Service → Repository) | 5개 엔드포인트 |
| Event에 `hasSession` / `purchaseType` 필드 | 도메인 + JPA + DTO 모두 |
| Session에 지역/온라인링크/가격/정원 필드 | ERD 확장 필요 |
| Order/Cart에 `sessionId` FK | 구매 단위 변경 |
| Frontend 세션 관리 탭 UI | EventForm 확장 |
| Frontend BFF 세션 API 라우트 | Next.js API Routes |

---

## 2. 핵심 설계 원칙

### 세션 = 구매 단위

현재:
```
Event 1 ←→ N Order (이벤트 전체를 구매)
```

변경 후:
```
Event 1 ←→ N Session ←→ N Order (세션 단위로 구매)
    └── hasSession=false → 시스템이 기본 세션 1개 자동 생성
```

### 세션 없는 이벤트 = 자동 1:1 매칭

```
이벤트 생성
  ├── hasSession = true  → 호스트가 세션 직접 생성 (1~N개)
  └── hasSession = false → 시스템이 기본 세션 1개 자동 생성 (is_default=true)
                            → 이벤트의 가격/날짜/장소를 그대로 복사
```

**핵심:** `hasSession=false`인 이벤트도 내부적으로는 세션 1개가 존재합니다.  
Order, Cart, Wishlist 등 모든 곳에서 **항상 세션 ID를 참조**하므로  
나중에 세션을 추가하거나 패키지를 만들 때 DB 스키마 변경이 필요 없습니다.

---

## 3. 확정된 설계 결정

| # | 결정 사항 | 결정 | 근거 |
|---|----------|------|------|
| 1 | 세션별 가격 vs 이벤트 전체 가격 | **세션별 개별 가격** | Event.price는 `hasSession=false`일 때 기본 세션 가격으로만 사용. 세션별로 다른 가치를 반영 가능 |
| 2 | 세션별 온/오프라인 독립 여부 | **세션별 독립** | 하나의 이벤트 내 하이브리드 구성 가능 (세션1: 오프라인 강남, 세션2: 온라인 Zoom) |
| 3 | 주문 있는 이벤트의 `hasSession` 전환 | **기본 세션 유지 + 추가만 허용** | 기존 기본 세션(is_default=true)의 주문은 유지하고 새 세션만 추가 가능 |
| 4 | 복수 세션 구매 시 Order 구조 | **세션마다 개별 Order** | 기존 Order 구조 최소 변경. `session_id` FK만 추가 |

---

## 4. DB 스키마 변경

### 4-1. EVENT_SESSION 테이블 (확장)

기존 ERD의 EVENT_SESSION 대비 구매 단위 역할을 위한 필드 추가:

```sql
CREATE TABLE event_session (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id        BIGINT NOT NULL,                    -- → EVENT.id (FK)
    
    -- 기본 정보
    title           VARCHAR(200) NOT NULL,              -- 세션 제목
    description     TEXT,                                -- 세션 설명
    sort_order      INT DEFAULT 0,                      -- 정렬 순서
    
    -- 시간
    start_time      TIMESTAMP,                          -- 세션 시작 시간
    end_time        TIMESTAMP,                          -- 세션 종료 시간
    
    -- 🆕 장소 / 온라인 (세션별 독립)
    location        VARCHAR(255),                       -- 세션별 장소 (지역/강의장)
    region_sido     VARCHAR(20),                        -- 시/도
    region_sigungu  VARCHAR(30),                        -- 시/군/구
    is_online       BOOLEAN DEFAULT FALSE,              -- 세션별 온/오프라인
    online_link     VARCHAR(500),                       -- 온라인 세션 URL (Zoom, Teams 등)
    
    -- 🆕 가격 / 정원 (구매 단위)
    price           INT DEFAULT 0,                      -- 세션별 가격
    max_attendees   INT DEFAULT 0,                      -- 세션별 정원
    current_attendees INT DEFAULT 0,                    -- 현재 등록 인원
    
    -- 🆕 시스템 관리
    is_default      BOOLEAN DEFAULT FALSE,              -- 자동 생성된 기본 세션 여부
    
    -- 타임스탬프
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_session_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

### 4-2. EVENT 테이블 필드 추가

```sql
ALTER TABLE events ADD COLUMN has_session    BOOLEAN DEFAULT FALSE;  -- 세션 사용 여부
ALTER TABLE events ADD COLUMN purchase_type  VARCHAR(10) DEFAULT 'SINGLE';  -- SINGLE/MULTI
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `has_session` | BOOLEAN | false면 기본 세션 자동 생성, true면 호스트가 세션 직접 관리 |
| `purchase_type` | VARCHAR(10) | `SINGLE` = 세션 1개만 구매 / `MULTI` = 여러 세션 동시 구매 |

### 4-3. ORDER 테이블 필드 추가

```sql
ALTER TABLE orders ADD COLUMN session_id BIGINT;  -- → EVENT_SESSION.id (FK)
ALTER TABLE orders ADD CONSTRAINT fk_order_session 
    FOREIGN KEY (session_id) REFERENCES event_session(id);
```

### 4-4. CART 테이블 필드 추가

```sql
ALTER TABLE cart ADD COLUMN session_id BIGINT;  -- → EVENT_SESSION.id (FK)
ALTER TABLE cart ADD CONSTRAINT fk_cart_session 
    FOREIGN KEY (session_id) REFERENCES event_session(id);
```

### 4-5. 변경 후 ERD 관계

```
EVENT 1 ──→ N EVENT_SESSION  (이벤트 → 세션들)
EVENT_SESSION 1 ──→ N ORDER   (세션 → 주문들)
EVENT_SESSION 1 ──→ N CART    (세션 → 장바구니)
```

---

## 5. 백엔드 구현 계획

### Phase 1: 도메인 모델 + JPA Entity

#### 1-1. `PurchaseType` Enum
```
event/domain/model/PurchaseType.java
```
```java
public enum PurchaseType {
    SINGLE,  // 세션 하나만 선택 구매
    MULTI    // 여러 세션 동시 구매 가능
}
```

#### 1-2. `EventSession` 도메인 모델
```
event/domain/model/EventSession.java
```
순수 POJO — 비즈니스 로직 포함:
- `isAvailable()` — 정원 체크 (currentAttendees < maxAttendees)
- `hasCapacity(int quantity)` — 수량만큼 자리 있는지
- `isDefault()` — 자동 생성 기본 세션 여부
- `incrementAttendees()` / `decrementAttendees()` — 참석자 수 관리
- `updateDetails(...)` — 세션 정보 수정

#### 1-3. `EventSessionJpaEntity`
```
event/adapter/out/persistence/entity/EventSessionJpaEntity.java
```
JPA 매핑:
- `@ManyToOne` → `EventJpaEntity`
- 모든 새 필드 포함 (location, region_sido, region_sigungu, is_online, online_link, price, max_attendees, current_attendees, is_default)

#### 1-4. `Event` 도메인 / JPA 필드 추가
- `hasSession: boolean`
- `purchaseType: PurchaseType`
- 도메인 모델, JPA Entity, Mapper 모두 업데이트

### Phase 2: Repository + Port

#### 2-1. Repository
```
event/adapter/out/persistence/repository/EventSessionJpaRepository.java
```
```java
List<EventSessionJpaEntity> findByEventIdOrderBySortOrder(Long eventId);
Optional<EventSessionJpaEntity> findByEventIdAndIsDefaultTrue(Long eventId);
int countByEventId(Long eventId);
```

#### 2-2. UseCase Port (in)
```
event/application/port/in/
  ├── CreateSessionUseCase.java
  ├── UpdateSessionUseCase.java
  ├── DeleteSessionUseCase.java
  ├── GetSessionUseCase.java
  └── ReorderSessionUseCase.java
```

#### 2-3. Persistence Port (out)
```
event/application/port/out/SessionPort.java
```
```java
EventSession save(EventSession session);
Optional<EventSession> findById(Long id);
List<EventSession> findByEventId(Long eventId);
void deleteById(Long id);
Optional<EventSession> findDefaultByEventId(Long eventId);
```

#### 2-4. Mapper
```
event/adapter/out/persistence/EventSessionMapper.java
```
도메인 ↔ JPA Entity 변환

### Phase 3: Service 구현

```
event/application/service/EventSessionService.java
```

핵심 로직:
1. **이벤트 생성 시 `hasSession=false`이면 기본 세션 자동 생성**
   - Event의 price, startDate, endDate, location, isOnline 정보 복사
   - `is_default = true` 설정
2. **세션 CRUD**
   - 생성: 이벤트 소유자 검증 → 세션 저장
   - 수정: 이벤트 소유자 + 세션 존재 검증 → 업데이트
   - 삭제: 이벤트 소유자 + 주문 존재 여부 검증 → 주문 있으면 삭제 불가
   - 목록: eventId로 조회, sortOrder 정렬
3. **세션 순서 변경 (Reorder)**
   - `List<Long> sessionIds` 순서대로 sortOrder 업데이트
4. **`hasSession` 전환 로직**
   - `false → true`: 기존 기본 세션(is_default=true) 유지, 새 세션 추가 가능
   - `true → false`: 추가 세션이 주문에 연결되어 있지 않으면 삭제 가능

### Phase 4: Controller (API)

> **아키텍처 원칙:** CRUD 주체가 다르면 Controller 분리 (교훈 3)  
> 기존 `HostEventController` + `EventController` 패턴을 따름

**호스트 CRUD:**
```
event/presentation/HostSessionController.java  (@RequestMapping("/host/events/{eventId}/sessions"))
```

| # | Method | Path | 설명 | Auth |
|---|--------|------|------|------|
| 37 | `POST` | `/host/events/{eventId}/sessions` | 세션 추가 | 🔑 HOST |
| 38 | `PUT` | `/host/events/{eventId}/sessions/{sessionId}` | 세션 수정 | 🔑 HOST |
| 39 | `DELETE` | `/host/events/{eventId}/sessions/{sessionId}` | 세션 삭제 | 🔑 HOST |
| 40 | `PATCH` | `/host/events/{eventId}/sessions/reorder` | 세션 순서 변경 | 🔑 HOST |

**일반 조회:**
```
event/presentation/EventController.java 에 추가 (또는 별도 SessionController.java)
```

| # | Method | Path | 설명 | Auth |
|---|--------|------|------|------|
| 36 | `GET` | `/events/{eventId}/sessions` | 세션 목록 조회 | ❌ |

### Phase 5: DTO

#### Request DTO
```
event/adapter/in/web/dto/SessionCreateRequest.java
```
```java
public record SessionCreateRequest(
    @NotBlank String title,
    String description,
    int sortOrder,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    String regionSido,
    String regionSigungu,
    boolean isOnline,
    String onlineLink,
    int price,
    int maxAttendees
) {}
```

```
event/adapter/in/web/dto/SessionUpdateRequest.java  — 동일 구조
event/adapter/in/web/dto/SessionReorderRequest.java
```
```java
public record SessionReorderRequest(
    @NotNull List<Long> sessionIds  // 새 순서대로 세션 ID 목록
) {}
```

#### Response DTO
```
event/adapter/in/web/dto/SessionResponse.java
```
```java
public record SessionResponse(
    Long id,
    Long eventId,
    String title,
    String description,
    int sortOrder,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    String regionSido,
    String regionSigungu,
    boolean isOnline,
    String onlineLink,
    int price,
    int maxAttendees,
    int currentAttendees,
    boolean isDefault
) {}
```

### Phase 6: 이벤트 생성/수정 API 확장

`EventCreateRequest`에 세션 관련 필드 추가:
```java
boolean hasSession,                      // 세션 사용 여부
PurchaseType purchaseType,               // SINGLE / MULTI
List<SessionCreateRequest> sessions      // 직접 생성할 세션 목록 (null이면 기본 세션)
```

---

## 6. 프론트엔드 구현 계획

### 6-1. EventForm 탭 UI 확장

현재 EventForm 단일 폼 → **탭 방식**으로 확장:

```
┌─────────────────────────────────────────────┐
│  강의 제목                                    │
│  강의 이미지                                   │
│  강의 정보                                    │
│                                             │
│  세션을 사용하시겠습니까?  [ ○ 사용안함  ● 사용 ] │
│                                             │
│  ┌──────┬────────┐                           │
│  │ ⚙️ 일반 │ 📋 세션  │  ← 탭 (hasSession일 때) │
│  └──────┴────────┘                           │
│                                             │
│  [일반 탭]                                    │
│  가격 / 날짜 / 온라인여부 / 장소               │
│  구매 모드: ○ 단일 세션 구매  ○ 복수 세션 구매   │
│                                             │
│  [세션 탭] (hasSession=true일 때만 표시)        │
│  ┌──────────────────────────────────────┐    │
│  │ 세션 1: 오리엔테이션                    │    │
│  │ 10:00-11:00 | 서울 강남구 | ₩30,000   │ ✏️🗑️│
│  ├──────────────────────────────────────┤    │
│  │ 세션 2: Spring Core                  │    │
│  │ 11:00-13:00 | 온라인 (Zoom) | ₩40,000 │ ✏️🗑️│
│  ├──────────────────────────────────────┤    │
│  │ + 세션 추가                           │    │
│  └──────────────────────────────────────┘    │
│                                             │
│  [임시 저장] [게시하기] [나가기]                │
└─────────────────────────────────────────────┘
```

### 6-2. UI 상태별 동작

| `hasSession` | 화면 | 가격/장소 |
|---|---|---|
| `false` | 탭 없음, 기존 폼만 표시 | 이벤트 레벨에서 입력 → 기본 세션에 복사 |
| `true` | 일반/세션 탭 전환 | 세션 탭에서 세션별로 개별 입력 |

### 6-3. 세션 편집 인라인 폼

세션 추가/편집 시 입력 필드:
- 세션 제목
- 세션 설명
- 시작/종료 시간
- 온라인 여부 토글
  - 온라인 → 링크 입력
  - 오프라인 → 장소 + 시/도 + 시/군/구 입력
- 가격
- 정원

### 6-4. Frontend BFF API 라우트 추가

> 아키텍처 원칙에 따라 호스트 CRUD와 일반 조회 경로를 분리

**호스트 CRUD:**
```
frontend/src/app/api/host/events/[eventId]/sessions/route.ts
  → POST: 백엔드 POST /v1/host/events/{eventId}/sessions 프록시

frontend/src/app/api/host/events/[eventId]/sessions/[sessionId]/route.ts
  → PUT:    백엔드 PUT /v1/host/events/{eventId}/sessions/{sessionId} 프록시
  → DELETE: 백엔드 DELETE /v1/host/events/{eventId}/sessions/{sessionId} 프록시

frontend/src/app/api/host/events/[eventId]/sessions/reorder/route.ts
  → PATCH: 백엔드 PATCH /v1/host/events/{eventId}/sessions/reorder 프록시
```

**일반 조회:**
```
frontend/src/app/api/events/[eventId]/sessions/route.ts
  → GET: 백엔드 GET /v1/events/{eventId}/sessions 프록시
```

### 6-5. 이벤트 상세 페이지 (고객 뷰) 변경

- `hasSession=true`: 세션 카드 목록 표시 (제목, 시간, 장소/링크, 가격, 잔여석, 구매/장바구니 버튼)
- `hasSession=false`: 현재와 동일 (단일 구매 버튼)
- 세션별 장바구니 추가: `POST /cart` 요청에 `sessionId` 포함

---

## 7. 향후 패키지 기능 설계

> 지금 당장 구현하지 않지만, 세션 CRUD 설계 시 호환성을 확보하기 위해 미리 검토한 내용

### 7-1. 개념

**패키지 = 여러 세션을 묶은 하나의 이벤트**

```
호스트 A의 이벤트들:
  Spring Boot 기초 → 세션1(개론), 세션2(실습)
  Spring JPA      → 세션3(엔티티), 세션4(쿼리)

패키지 이벤트:
  "Spring 풀코스 패키지" = 세션1 + 세션3 + 세션4 (묶음 판매)
```

패키지는 **이벤트 목록에 함께 노출**되는 하나의 이벤트로 취급됩니다.

### 7-2. DB 구조 (향후)

`EventType`에 `PACKAGE` 추가 + 테이블 2개 신규:

```sql
-- EventType enum에 PACKAGE 추가
-- SEMINAR, CLASS, MEETUP, CONFERENCE, PACKAGE

-- 패키지 메타 정보
CREATE TABLE session_package (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id        BIGINT NOT NULL,              -- → EVENT.id (type=PACKAGE인 이벤트)
    pricing_type    VARCHAR(20) NOT NULL,          -- FLAT_PRICE / INDIVIDUAL_DISCOUNT
    flat_price      INT,                           -- 통 가격 (FLAT_PRICE 모드 시)
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 패키지에 포함된 세션 목록
CREATE TABLE session_package_item (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_id      BIGINT NOT NULL,               -- → SESSION_PACKAGE.id
    session_id      BIGINT NOT NULL,               -- → EVENT_SESSION.id
    discount_rate   INT DEFAULT 0,                 -- 개별 할인율 (INDIVIDUAL_DISCOUNT 모드 시)
    sort_order      INT DEFAULT 0
);
```

### 7-3. 가격 모드

호스트가 패키지 생성 시 2가지 중 선택:

| 모드 | 설명 | 예시 |
|------|------|------|
| **통 가격 (FLAT_PRICE)** | 패키지에 단일 가격 설정 | 세션 3개 합계 ₩110,000 → 패키지 ₩79,000 |
| **세션별 할인 (INDIVIDUAL_DISCOUNT)** | 세션마다 할인율 설정, 합산 | 세션1: 20%, 세션2: 30%, 세션3: 20% → 합계 ₩84,000 |

### 7-4. 권한 구분

| 역할 | 가능한 작업 |
|------|-----------|
| **호스트** | 자기 이벤트의 세션만 불러와서 패키지 구성 |
| **어드민** | 모든 호스트의 세션 검색 → 크로스 호스트 패키지 구성 가능 |

> ⚠️ **크로스 호스트 패키지**의 경우 정산 로직(호스트별 수익 분배)이 복잡해지므로  
> MVP에서는 호스트 자기 세션 패키지만 → 이후 어드민 크로스 패키지 순서로 구현 권장

### 7-5. 현재 세션 설계와의 호환성

| 지금 구현하는 것 | 패키지 추가 시 |
|---|---|
| `EVENT_SESSION`에 price, location 등 | 그대로 활용 ✅ |
| `Order.session_id` FK | 패키지 구매 시 각 세션별 Order 생성 ✅ |
| `EventType` (4개 유형) | `PACKAGE` 추가만 하면 됨 ✅ |
| `Event.has_session=false → 기본 세션` | 패키지 이벤트도 `has_session=false` ✅ |

**결론:** 세션 CRUD를 잘 만들면 패키지는 테이블 2개(`session_package`, `session_package_item`)와 `EventType.PACKAGE` 추가만으로 구현 가능.

### 7-6. 패키지 구현 우선순위

```
1단계: 호스트 패키지 (자기 세션, 통 가격)         ← 가장 단순
2단계: 세션별 할인 모드 추가                      ← pricing_type 분기만
3단계: 어드민 크로스 호스트 패키지 + 정산 로직       ← 복잡, 후순위
```

---

## 8. 구현 워크플로 (기능별 BE+FE 묶음)

> **원칙:** 기능 단위로 BE API 구현 → 즉시 FE 연결까지 한 번에 검증.  
> API를 두 번 검증하지 않도록 백엔드와 프론트엔드를 묶어서 진행.

---

### Step 1: 세션 도메인 기반 구축 (BE 선행)

> **범위:** BE only — 이후 Step의 토대가 되는 도메인/인프라 레이어  
> **FE 없음:** 이 단계는 API가 아직 없으므로 BE 컴파일 검증만

#### 1-1. PurchaseType Enum 생성
- 파일: `event/domain/model/PurchaseType.java`
- 값: `SINGLE` (세션 하나만 구매), `MULTI` (여러 세션 동시 구매)

#### 1-2. EventSession 도메인 모델 생성
- 파일: `event/domain/model/EventSession.java`
- 순수 POJO, JPA 의존 없음
- 필드: id, eventId, title, description, sortOrder, startTime, endTime, location, regionSido, regionSigungu, isOnline, onlineLink, price, maxAttendees, currentAttendees, isDefault, createdAt, updatedAt
- 비즈니스 메서드: `isAvailable()`, `hasCapacity(int)`, `incrementAttendees(int)`, `decrementAttendees(int)`, `updateDetails(...)`

#### 1-3. EventSessionJpaEntity 생성
- 파일: `event/adapter/out/persistence/entity/EventSessionJpaEntity.java`
- `@Entity @Table(name = "event_sessions")`
- `@ManyToOne(fetch = FetchType.LAZY)` → EventJpaEntity
- `@Builder`, `@CreationTimestamp`, `@UpdateTimestamp`

#### 1-4. EventSessionJpaRepository 생성
- 파일: `event/adapter/out/persistence/repository/EventSessionJpaRepository.java`
- `findByEventIdOrderBySortOrder(Long eventId)`
- `findByEventIdAndIsDefaultTrue(Long eventId)`
- `countByEventId(Long eventId)`

#### 1-5. EventSessionMapper 생성
- 파일: `event/adapter/out/persistence/EventSessionMapper.java`
- `toDomain(EventSessionJpaEntity)` → `EventSession`
- `toJpaEntity(EventSession, EventJpaEntity)` → `EventSessionJpaEntity`

#### 1-6. SessionPort (out 포트) 생성
- 파일: `event/application/port/out/SessionPort.java`
- 인터페이스: `save()`, `findById()`, `findByEventId()`, `deleteById()`, `findDefaultByEventId()`

#### 1-7. EventSessionPersistenceAdapter 생성
- 파일: `event/adapter/out/persistence/EventSessionPersistenceAdapter.java`
- `SessionPort` 구현 — Repository + Mapper 조합

#### 1-8. Event 도메인에 필드 추가
- `Event.java`에 `hasSession(boolean)`, `purchaseType(PurchaseType)` 추가
- 생성자, getter, `updateDetails()` 업데이트

#### 1-9. EventJpaEntity에 필드 추가
- `EventJpaEntity.java`에 `has_session`, `purchase_type` 컬럼 추가

#### 1-10. EventMapper 업데이트
- `EventMapper.java`에 hasSession, purchaseType 매핑 추가

#### ✅ 검증
```bash
cd backend && ./gradlew compileJava
```
컴파일 에러 없으면 Step 1 완료.

---

### Step 2: 세션 CRUD API + 이벤트 폼 세션 탭 (BE + FE)

> **범위:** 세션 5개 API 전체 + EventForm 세션 관리 탭  
> **BE → FE 순서로 구현, API 수정 즉시 프론트 연결 검증**

#### BE 파트

**2-1. UseCase Port (in) 생성**
- 파일 위치: `event/application/port/in/`
- `CreateSessionUseCase.java` — inner record `CreateSessionCommand` 포함
- `UpdateSessionUseCase.java` — inner record `UpdateSessionCommand` 포함
- `DeleteSessionUseCase.java`
- `GetSessionUseCase.java`
- `ReorderSessionUseCase.java` — inner record `ReorderCommand` 포함

**2-2. EventSessionService 구현**
- 파일: `event/application/service/EventSessionService.java`
- 모든 UseCase 구현
- **createSession:** 이벤트 조회 → 소유자 검증 → 세션 저장
- **updateSession:** 세션 조회 → 소유자 검증 → updateDetails → 저장
- **deleteSession:** 소유자 검증 → is_default면 삭제 불가 → 주문 있으면 삭제 불가 → 삭제
- **getSessions:** eventId로 조회, sortOrder 정렬
- **reorderSessions:** 소유자 검증 → sessionIds 순서대로 sortOrder 업데이트
- **createDefaultSession:** 이벤트 생성 시 `hasSession=false`면 이벤트 정보를 복사한 기본 세션 자동 생성

**2-3. Request/Response DTO 생성**
- `SessionCreateRequest.java` — title, description, sortOrder, startTime, endTime, location, regionSido, regionSigungu, isOnline, onlineLink, price, maxAttendees + `toCommand()` 메서드
- `SessionUpdateRequest.java` — 동일 구조 + `toCommand(eventId, sessionId, requesterId)`
- `SessionReorderRequest.java` — `List<Long> sessionIds`
- `SessionResponse.java` — 전체 필드 + `static from(EventSession)` 팩토리

**2-4. HostSessionController 생성 (호스트 CRUD)**
- 파일: `event/presentation/HostSessionController.java`
- 경로 prefix: `/host/events/{eventId}/sessions`
- 기존 `HostEventController` 패턴 따름
- `POST   /host/events/{eventId}/sessions` — 세션 추가 (HOST, X-User-Id)
- `PUT    /host/events/{eventId}/sessions/{sessionId}` — 세션 수정 (HOST)
- `DELETE /host/events/{eventId}/sessions/{sessionId}` — 세션 삭제 (HOST)
- `PATCH  /host/events/{eventId}/sessions/reorder` — 세션 순서 변경 (HOST)

**2-5. SessionController 확장 (일반 조회)**
- 파일: `event/presentation/EventController.java`에 추가 또는 별도 `SessionController.java`
- 경로: `/events/{eventId}/sessions`
- `GET /events/{eventId}/sessions` — 세션 목록 조회 (인증 불필요)

**2-6. EventCreateRequest/UpdateRequest 확장**
- `hasSession`, `purchaseType`, `List<SessionCreateRequest> sessions` 필드 추가
- 이벤트 생성 서비스에서 세션 처리 로직 연동

**2-7. EventDetailResponse 확장**
- `sessions: List<SessionResponse>` 필드 추가
- 이벤트 상세 API에서 세션 목록 포함하여 반환

**2-8. BE 컴파일 검증**
```bash
cd backend && ./gradlew compileJava
```

#### FE 파트

**2-9. BFF API 라우트 생성**
- **호스트 CRUD (기존 BFF 패턴 따름):**
  - `frontend/src/app/api/host/events/[eventId]/sessions/route.ts` — POST
  - `frontend/src/app/api/host/events/[eventId]/sessions/[sessionId]/route.ts` — PUT, DELETE
  - `frontend/src/app/api/host/events/[eventId]/sessions/reorder/route.ts` — PATCH
- **일반 조회:**
  - `frontend/src/app/api/events/[eventId]/sessions/route.ts` — GET

**2-10. EventForm에 세션 토글 + 탭 추가**
- `EventForm.tsx` 수정
- formData에 `hasSession`, `purchaseType`, `sessions` 추가
- 세션 토글 UI: 스위치 방식
- hasSession=true일 때 **일반 | 세션** 탭 표시

**2-11. SessionTab 컴포넌트 생성**
- 파일: `frontend/src/app/events/new/_components/SessionTab.tsx`
- 세션 카드 리스트 (sortOrder 순)
- 각 카드: 제목, 시간, 장소/링크, 가격, 정원, ✏️수정 🗑️삭제 버튼
- "+ 세션 추가" 버튼

**2-12. SessionForm 컴포넌트 생성**
- 파일: `frontend/src/app/events/new/_components/SessionForm.tsx`
- 세션 추가/수정 인라인 폼
- 필드: 제목, 설명, 시작/종료, 온라인 토글(→링크 or 장소), 가격, 정원
- 저장/취소 버튼

**2-13. CSS 스타일 추가**
- 파일: `frontend/src/app/events/new/_components/SessionTab.module.css`

**2-14. handleSubmit 확장**
- payload에 `hasSession`, `purchaseType`, `sessions` 포함

#### ✅ 통합 검증
1. 백엔드 서버 실행
2. 프론트 dev 서버 실행
3. 이벤트 생성 페이지 → 세션 토글 ON → 탭 전환 확인
4. 세션 추가 → POST API → 목록 반영 확인
5. 세션 수정 → PUT API → 변경 반영 확인
6. 세션 삭제 → DELETE API → 목록에서 제거 확인
7. 세션 없이 이벤트 생성 → 기본 세션 자동 생성 확인 (DB 확인)

---

### Step 3: 구매 연동 + 이벤트 상세 세션 UI (BE + FE)

> **범위:** Order/Cart에 sessionId 연결 + 이벤트 상세 페이지 세션 구매 UI  
> **핵심:** 세션이 실제 구매 단위로 작동하게 만드는 마무리 단계

#### BE 파트

**3-1. Order 도메인에 sessionId 추가**
- `Order.java`에 `sessionId: Long` 필드 추가
- `createPending()` 팩토리 메서드에 `sessionId` 파라미터 추가
- 생성자, getter 업데이트

**3-2. OrderJpaEntity에 sessionId 추가**
- `OrderJpaEntity`에 `session_id` 컬럼 + `@ManyToOne` → `EventSessionJpaEntity`
- OrderMapper 업데이트

**3-3. Cart 도메인/JPA에 sessionId 추가**
- Cart 도메인 모델에 `sessionId: Long` 필드 추가
- CartJpaEntity에 `session_id` 컬럼 + FK 추가
- CartMapper 업데이트

**3-4. 주문 생성 API 수정**
- `OrderCreateRequest`에 `sessionId` 필드 추가
- 주문 생성 시 세션 존재 확인 + 정원 체크 (`session.hasCapacity()`)
- 주문 확정 시 세션의 `currentAttendees` 증가
- 주문 취소/환불 시 세션의 `currentAttendees` 감소

**3-5. 장바구니 API 수정**
- `CartCreateRequest`에 `sessionId` 필드 추가
- 장바구니 추가 시 세션 기준 중복 체크
- 장바구니 목록 응답에 세션 정보 포함

**3-6. BE 컴파일 검증**
```bash
cd backend && ./gradlew compileJava
```

#### FE 파트

**3-7. 이벤트 상세 페이지 세션 목록 표시**
- `frontend/src/app/events/[id]/page.tsx` 수정
- `hasSession=true`: 세션 카드 목록 표시
  - 카드 내용: 세션 제목, 시간, 장소/온라인링크, 가격, 잔여석(`max - current`)
  - 각 카드에 **구매** / **장바구니 담기** 버튼
- `hasSession=false`: 현재와 동일 (단일 구매 버튼, 기본 세션 ID 자동 전달)

**3-8. 주문 생성 요청에 sessionId 포함**
- `POST /api/orders` 호출 시 `sessionId` 파라미터 전달
- `hasSession=false` 이벤트: 기본 세션(is_default=true)의 ID 자동 사용

**3-9. 장바구니 요청에 sessionId 포함**
- `POST /api/cart` 호출 시 `sessionId` 파라미터 전달
- 장바구니 페이지에서 **"이벤트명 > 세션명"** 형태로 아이템 표시

**3-10. purchaseType에 따른 UI 분기**
- `SINGLE`: 세션 선택 시 라디오 버튼 형태 (1개만 선택 가능)
- `MULTI`: 체크박스 형태 (여러 세션 선택 후 한번에 장바구니/구매)

#### ✅ 통합 검증
1. 세션 있는 이벤트 상세 → 세션 카드 목록 표시 확인
2. 세션 카드에서 구매 → Order에 sessionId 저장 확인
3. 세션 카드에서 장바구니 → Cart에 sessionId 저장 확인
4. 세션 없는 이벤트 → 기존과 동일하게 구매 동작 확인 (기본 세션 ID 자동)
5. `SINGLE` 모드 → 세션 1개만 선택 가능 확인
6. `MULTI` 모드 → 여러 세션 선택 구매 확인
7. 주문 확정 후 세션 currentAttendees 증가 확인
8. 정원 초과 시 구매 차단 확인

---

## 9. 검증 체크리스트

### 세션 기본 CRUD
- [ ] `hasSession=false` 이벤트 생성 → 기본 세션 자동 생성 (is_default=true)
- [ ] `hasSession=true` 이벤트 생성 → 세션 직접 입력 가능
- [ ] 세션 생성 (POST) — 이벤트 소유자만 가능
- [ ] 세션 수정 (PUT) — 이벤트 소유자만 가능
- [ ] 세션 삭제 (DELETE) — 주문 있으면 삭제 불가
- [ ] 세션 목록 조회 (GET) — sortOrder 정렬
- [ ] 세션 순서 변경 (PATCH reorder)

### 세션 필드
- [ ] 세션별 장소 저장/조회 (location, region_sido, region_sigungu)
- [ ] 세션별 온라인 링크 저장/조회 (is_online=true일 때 online_link)
- [ ] 세션별 가격 저장/조회
- [ ] 세션별 정원 + 현재 인원 관리

### hasSession 전환
- [ ] `false → true`: 기본 세션 유지 + 추가 세션 생성 가능
- [ ] 이벤트 수정에서 hasSession 변경 시 기존 데이터 보존

### 구매 연동
- [ ] 세션 단위 주문 생성 (Order.sessionId)
- [ ] 세션 단위 장바구니 추가 (Cart.sessionId)
- [ ] `purchaseType=SINGLE` — 세션 1개만 선택 가능
- [ ] `purchaseType=MULTI` — 여러 세션 동시 선택/구매 가능

### 프론트엔드
- [ ] EventForm에서 세션 사용 토글 동작
- [ ] 세션 탭 표시/숨김 전환
- [ ] 세션 추가/수정/삭제 UI 정상 동작
- [ ] 이벤트 상세 페이지 — 세션 카드 목록 표시
- [ ] 이벤트 상세 페이지 — 세션별 구매/장바구니 버튼
