# 🔧 이벤트/세션/티켓 CRUD 구현 워크플로우

> **작성일:** 2026-04-10  
> **기반 설계:** `티켓_중심_설계서.md`, `이벤트_상태관리_설계서.md`, `아키텍처_v6`, `ERD_v6`, `API_스펙_v6`  
> **목표:** 현재 코드 → v6 아키텍처로 전환 (이벤트/세션/티켓 CRUD + 상태 관리)

---

## 📌 현재 코드 상태 분석

### 현재 존재하는 것

| 파일 | 현재 상태 |
|------|----------|
| `Event.java` (domain) | price, maxAttendees, location, startDate, endDate, purchaseType 포함 |
| `EventSession.java` (domain) | price, maxAttendees, location, region 포함 |
| `EventJpaEntity.java` | price, maxAttendees, location, startDate, endDate, purchaseType 컬럼 |
| `EventSessionJpaEntity.java` | price 컬럼 포함, 모집 필드 없음 |
| `PurchaseType.java` | SINGLE, MULTI enum |
| `OrderJpaEntity.java` | session_id FK 참조 |
| `CartJpaEntity.java` | event_id FK 참조 |
| `CreateOrderRequest.java` | eventId, sessionId 필드 |

### v6으로 변경해야 할 것

| 변경 대상 | 변경 내용 |
|-----------|----------|
| `Event` | ⛔ price, maxAttendees, location, startDate, endDate, purchaseType **제거** |
| `EventSession` → `Session` | ⛔ price 제거, ✅ 모집 필드 3개 추가 |
| `PurchaseType.java` | ⛔ **삭제** |
| `RecruitmentStatus.java` | 🆕 **생성** |
| `Ticket` 도메인 | 🆕 **전체 신규** (ticket 모듈) |
| `Order` | 🔄 session_id → ticket_id |
| `Cart` | 🔄 event_id → ticket_id |

---

## 📌 구현 페이즈 개요

```mermaid
graph LR
    P1["Phase 1<br/>Event 도메인 정리<br/>필드 제거 + 상태 모델"] --> P2["Phase 2<br/>Session 리팩토링<br/>모집 필드 추가"]
    P2 --> P3["Phase 3<br/>Ticket 도메인 신규<br/>전체 CRUD"]
    P3 --> P4["Phase 4<br/>Order/Cart 연동<br/>ticketId 참조 전환"]
    P4 --> P5["Phase 5<br/>프론트엔드 연동<br/>이벤트 생성 폼 수정"]
```

---

## Phase 1. Event 도메인 정리 (필드 제거 + 상태 모델)

### 1-1. `PurchaseType.java` 삭제

```
삭제: event/domain/model/PurchaseType.java
```

### 1-2. `EventStatus.java` 수정

```diff
 public enum EventStatus {
-    DRAFT, PUBLISHED, PREPARING, ONGOING, ENDED, CANCELLED
+    DRAFT, PUBLISHED, ENDED, CANCELLED
+    // ONGOING은 DB에 저장하지 않음 — 세션 기반 Computed
 }
```

### 1-3. `RecruitmentStatus.java` 생성

```
신규: event/domain/model/RecruitmentStatus.java
```

```java
public enum RecruitmentStatus {
    PENDING,  // 모집 대기
    OPEN,     // 모집중
    CLOSED    // 마감
}
```

### 1-4. `Event.java` 도메인 수정

**제거할 필드:**
- `location`, `isOnline` → 세션으로 이동 완료 (세션에 이미 존재)
- `price`, `maxAttendees` → 세션/티켓으로 이동
- `startDate`, `endDate` → 세션에서 도출
- `purchaseType` → 삭제

**유지할 필드:**
- `id`, `creatorId`, `categoryId`, `title`, `description`, `type`, `status`, `thumbnailUrl`, `hasSession`, `isHidden`, `createdAt`, `updatedAt`

**추가할 메서드:**
- `getEffectiveStatus(List<Session> sessions)` → ONGOING 계산
- `getRecruitmentStatus(List<Session> sessions)` → OR 종합
- `getStartDate(List<Session> sessions)` → min(startTime)
- `getEndDate(List<Session> sessions)` → max(endTime)

**수정 범위:**

| 파일 | 변경 |
|------|------|
| `Event.java` | 필드 제거, 생성자 수정, updateDetails 수정, Computed 메서드 추가 |
| `EventJpaEntity.java` | price, maxAttendees, location, startDate, endDate, purchaseType, isOnline 컬럼 제거 |
| `EventMapper.java` | 매핑 로직 수정 |
| `CreateEventUseCase.java` | Command에서 price, maxAttendees, location, startDate, endDate, purchaseType 제거 |
| `EventCreateRequest.java` | DTO에서 price, maxAttendees, location, isOnline, startDate, endDate, purchaseType 제거 |
| `EventUpdateRequest.java` | 위와 동일 |
| `UpdateEventUseCase.java` | Command 수정 |
| `EventCommandService.java` | createEvent, updateEvent 로직 수정 |
| `EventDetailResponse.java` | 세션/티켓 기반 응답으로 재구성 |
| `EventListResponse.java` | minPrice, totalCapacity 등 Computed 필드 추가 |

### 1-5. DB 마이그레이션 (flyway 또는 DDL)

```sql
-- Event 테이블에서 불필요 컬럼 제거
ALTER TABLE events DROP COLUMN IF EXISTS price;
ALTER TABLE events DROP COLUMN IF EXISTS max_attendees;
ALTER TABLE events DROP COLUMN IF EXISTS location;
ALTER TABLE events DROP COLUMN IF EXISTS is_online;
ALTER TABLE events DROP COLUMN IF EXISTS start_date;
ALTER TABLE events DROP COLUMN IF EXISTS end_date;
ALTER TABLE events DROP COLUMN IF EXISTS purchase_type;
```

### Phase 1 체크리스트

- [ ] `PurchaseType.java` 삭제
- [ ] `EventStatus.java` 수정 (PREPARING 제거)
- [ ] `RecruitmentStatus.java` 생성
- [ ] `Event.java` 필드 제거 + Computed 메서드 추가
- [ ] `EventJpaEntity.java` 컬럼 제거
- [ ] `EventMapper.java` 매핑 수정
- [ ] `CreateEventUseCase.java` Command 수정
- [ ] `UpdateEventUseCase.java` Command 수정
- [ ] `EventCreateRequest.java` DTO 수정
- [ ] `EventUpdateRequest.java` DTO 수정
- [ ] `EventCommandService.java` 서비스 로직 수정
- [ ] `EventDetailResponse.java` 응답 재구성
- [ ] `EventListResponse.java` Computed 필드 추가
- [ ] PurchaseType 참조하는 모든 import 제거
- [ ] DB 마이그레이션 스크립트 작성
- [ ] 컴파일 확인

---

## Phase 2. Session 리팩토링 (모집 필드 추가 + 네이밍)

### 2-1. `EventSession.java` → `Session.java` 리네이밍

> 도메인 모델 클래스명만 변경. 패키지는 `event/domain/model/` 유지.

```
event/domain/model/EventSession.java → event/domain/model/Session.java
```

### 2-2. `Session.java` 변경 사항

**제거:**
- `price` 필드 + getter + updateDetails 파라미터

**추가:**
```java
// 모집 관리 필드
private LocalDateTime recruitStartDate;
private LocalDateTime recruitEndDate;
private boolean isRecruitmentClosed;
```

**추가할 메서드:**
```java
/** 이 세션의 모집 상태 계산 */
public RecruitmentStatus getRecruitmentStatus() {
    if (isRecruitmentClosed) return RecruitmentStatus.CLOSED;
    if (maxAttendees > 0 && currentAttendees >= maxAttendees) return RecruitmentStatus.CLOSED;
    LocalDateTime now = LocalDateTime.now();
    if (recruitStartDate != null && now.isBefore(recruitStartDate)) return RecruitmentStatus.PENDING;
    if (recruitEndDate != null && now.isAfter(recruitEndDate)) return RecruitmentStatus.CLOSED;
    return RecruitmentStatus.OPEN;
}

/** 이 세션의 진행 상태 계산 */
public EventStatus getSessionStatus() {
    LocalDateTime now = LocalDateTime.now();
    if (startTime != null && endTime != null) {
        if (now.isBefore(startTime)) return EventStatus.PUBLISHED;
        if (now.isAfter(endTime)) return EventStatus.ENDED;
        return EventStatus.ONGOING;
    }
    return EventStatus.PUBLISHED;
}

/** 수동 마감/재개 */
public void closeRecruitment() { this.isRecruitmentClosed = true; }
public void openRecruitment() { this.isRecruitmentClosed = false; }
```

### 2-3. JPA Entity 수정

```
EventSessionJpaEntity.java → SessionJpaEntity.java (클래스명만 변경)
테이블명 @Table(name = "event_sessions") 유지
```

**변경:**
- `price` 컬럼 제거
- `recruit_start_date`, `recruit_end_date`, `is_recruitment_closed` 컬럼 추가

### 2-4. 관련 파일 전체 리네이밍 + 수정

| 현재 파일 | 변경 후 |
|-----------|---------|
| `EventSession.java` | `Session.java` |
| `EventSessionJpaEntity.java` | `SessionJpaEntity.java` |
| `EventSessionMapper.java` | `SessionMapper.java` |
| `EventSessionPersistenceAdapter.java` | `SessionPersistenceAdapter.java` |
| `EventSessionJpaRepository.java` | `SessionJpaRepository.java` |
| `SessionCreateRequest.java` | DTO에 regionSido, regionSigungu, recruitStart/End 추가 |
| `SessionUpdateRequest.java` | 위와 동일 |
| `SessionResponse.java` | recruitmentStatus, sessionStatus 추가 |
| `CreateSessionUseCase.java` | Command에서 price 제거, recruit 필드 추가 |
| `EventSessionService.java` | `SessionService.java` (또는 유지) |

### 2-5. DB 마이그레이션

```sql
-- Session 테이블 컬럼 변경
ALTER TABLE event_sessions DROP COLUMN IF EXISTS price;
ALTER TABLE event_sessions ADD COLUMN recruit_start_date TIMESTAMP;
ALTER TABLE event_sessions ADD COLUMN recruit_end_date TIMESTAMP;
ALTER TABLE event_sessions ADD COLUMN is_recruitment_closed BOOLEAN NOT NULL DEFAULT false;
```

### Phase 2 체크리스트

- [ ] `EventSession.java` → `Session.java` 리네이밍
- [ ] `Session.java`에서 price 제거, 모집 필드 3개 추가
- [ ] `Session.java`에 getRecruitmentStatus(), getSessionStatus() 추가
- [ ] `EventSessionJpaEntity.java` → `SessionJpaEntity.java` 리네이밍
- [ ] JPA Entity에서 price 컬럼 제거, 모집 컬럼 3개 추가
- [ ] Mapper/Adapter/Repository 리네이밍
- [ ] DTO (CreateRequest, UpdateRequest, Response) 수정
- [ ] UseCase/Service 수정
- [ ] Controller 수정 (모집 마감/재개 API 추가)
- [ ] 기존 EventSession 참조하는 모든 파일 import 수정
- [ ] DB 마이그레이션 스크립트
- [ ] 컴파일 확인

---

## Phase 3. Ticket 도메인 신규 생성

### 3-1. 전체 생성 파일 목록

```
com.venueon.ticket/
├── domain/model/
│   └── Ticket.java
├── application/
│   ├── port/in/
│   │   ├── CreateTicketUseCase.java
│   │   ├── GetTicketUseCase.java
│   │   ├── UpdateTicketUseCase.java
│   │   └── DeleteTicketUseCase.java
│   ├── port/out/
│   │   └── TicketRepositoryPort.java
│   └── service/
│       └── TicketService.java
├── adapter/
│   ├── in/web/
│   │   ├── HostTicketController.java
│   │   └── dto/
│   │       ├── TicketCreateRequest.java
│   │       ├── TicketUpdateRequest.java
│   │       └── TicketResponse.java
│   └── out/persistence/
│       ├── entity/
│       │   ├── TicketJpaEntity.java
│       │   └── TicketSessionJpaEntity.java (또는 @JoinTable)
│       ├── repository/
│       │   ├── TicketJpaRepository.java
│       │   └── TicketSessionJpaRepository.java
│       ├── TicketPersistenceAdapter.java
│       └── TicketMapper.java
```

### 3-2. `Ticket.java` 도메인 모델

```java
public class Ticket {
    private Long id;
    private Long eventId;
    private String name;          // "전체 패키지", "Day 1 입장권"
    private String description;
    private int price;            // 실제 판매가
    private int originalPrice;    // 정가 (할인 전)
    private Integer maxQuantity;  // NULL = 무제한
    private int soldCount;
    private boolean isAllSessions;
    private int sortOrder;
    private boolean isActive;
    private LocalDateTime salesStart;
    private LocalDateTime salesEnd;
    private List<Long> sessionIds; // 매핑된 세션 ID 목록
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 비즈니스 메서드
    public boolean isOnSale();           // 판매 기간 내 + isActive
    public boolean hasStock(int qty);    // maxQuantity 확인
    public int getDiscountRate();        // (original - price) / original * 100
    public Integer getRemainingQuantity(); // maxQuantity - soldCount or null
    public void incrementSoldCount(int qty);
    public void decrementSoldCount(int qty);
}
```

### 3-3. `TicketJpaEntity.java`

```java
@Entity
@Table(name = "tickets")
public class TicketJpaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private EventJpaEntity event;

    private String name;
    private String description;
    private int price;
    private int originalPrice;
    private Integer maxQuantity;  // nullable
    private int soldCount;
    private boolean isAllSessions;
    private int sortOrder;
    private boolean isActive;
    private LocalDateTime salesStart;
    private LocalDateTime salesEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3-4. `TicketSessionJpaEntity.java` (매핑 테이블)

```java
@Entity
@Table(name = "ticket_sessions")
@IdClass(TicketSessionId.class)
public class TicketSessionJpaEntity {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private TicketJpaEntity ticket;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private SessionJpaEntity session;
}
```

### 3-5. API 엔드포인트 (HostTicketController)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/v1/events/{eventId}/tickets` | 이벤트의 티켓 목록 (공개) |
| `POST` | `/v1/host/events/{eventId}/tickets` | 티켓 생성 |
| `PUT` | `/v1/host/tickets/{ticketId}` | 티켓 수정 |
| `DELETE` | `/v1/host/tickets/{ticketId}` | 티켓 삭제 |

### 3-6. TicketCreateRequest

```java
public record TicketCreateRequest(
    @NotBlank String name,
    String description,
    @Min(0) int price,
    @Min(0) int originalPrice,
    Integer maxQuantity,        // null = 무제한
    boolean isAllSessions,
    List<Long> sessionIds,      // isAllSessions=false일 때 필수
    int sortOrder,
    LocalDateTime salesStart,   // null = 즉시
    LocalDateTime salesEnd      // null = 이벤트 종료까지
) {}
```

### 3-7. 비즈니스 로직 핵심

```
티켓 생성 시:
1. eventId로 이벤트 존재 확인
2. 이벤트 소유자 확인
3. isAllSessions=false면 sessionIds 필수 검증
4. sessionIds가 해당 이벤트의 세션인지 확인
5. 저장 → ticket_sessions 매핑 저장

티켓 삭제 시:
1. soldCount > 0이면 삭제 불가 (422)
2. 활성 주문 존재 시 삭제 불가
```

### 3-8. 이벤트 생성 시 기본 티켓 자동 생성

```
hasSession=false (단일 이벤트):
  → 기본 세션 1개 자동 생성 (기존 로직 유지)
  → 기본 티켓 1개 자동 생성 (isAllSessions=true, 호스트 입력 가격)

hasSession=true (다중 세션):
  → 호스트가 세션 직접 구성
  → 호스트가 티켓 직접 구성 (프론트에서 Step 4)
```

### 3-9. DB 마이그레이션

```sql
CREATE TABLE tickets (
    id              BIGSERIAL PRIMARY KEY,
    event_id        BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price           INT NOT NULL DEFAULT 0,
    original_price  INT NOT NULL DEFAULT 0,
    max_quantity    INT,
    sold_count      INT NOT NULL DEFAULT 0,
    is_all_sessions BOOLEAN NOT NULL DEFAULT false,
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sales_start     TIMESTAMP,
    sales_end       TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP
);

CREATE TABLE ticket_sessions (
    ticket_id  BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
    PRIMARY KEY (ticket_id, session_id)
);
```

### Phase 3 체크리스트

- [ ] `ticket/` 패키지 전체 생성
- [ ] `Ticket.java` 도메인 모델
- [ ] `TicketJpaEntity.java` + `TicketSessionJpaEntity.java`
- [ ] `TicketJpaRepository.java` + `TicketSessionJpaRepository.java`
- [ ] `TicketMapper.java`
- [ ] `TicketPersistenceAdapter.java`
- [ ] `TicketRepositoryPort.java` (port/out)
- [ ] `CreateTicketUseCase.java`, `GetTicketUseCase.java`, `UpdateTicketUseCase.java`, `DeleteTicketUseCase.java`
- [ ] `TicketService.java`
- [ ] `HostTicketController.java`
- [ ] `TicketCreateRequest.java`, `TicketUpdateRequest.java`, `TicketResponse.java`
- [ ] 이벤트 생성 시 기본 티켓 자동 생성 로직 (EventCommandService)
- [ ] DB 마이그레이션 (tickets, ticket_sessions)
- [ ] 컴파일 + API 테스트

---

## Phase 4. Order / Cart 연동 (ticketId 참조 전환)

### 4-1. OrderJpaEntity 수정

```diff
  @ManyToOne(fetch = FetchType.LAZY)
- @JoinColumn(name = "session_id")
- private EventSessionJpaEntity session;
+ @JoinColumn(name = "ticket_id")
+ private TicketJpaEntity ticket;
```

### 4-2. CartJpaEntity 수정

```diff
  @ManyToOne(fetch = FetchType.LAZY)
- @JoinColumn(name = "event_id", nullable = false)
- private EventJpaEntity event;
+ @JoinColumn(name = "ticket_id", nullable = false)
+ private TicketJpaEntity ticket;
```

### 4-3. CreateOrderRequest 수정

```diff
- @NotNull private Long eventId;
- private Long sessionId;
+ @NotNull private Long ticketId;
```

### 4-4. OrderService 주문 생성 로직 변경

```
기존: eventId → 이벤트 검증 → session 정원 확인 → 주문 생성
변경: ticketId → 티켓 검증 → 판매 기간/수량 확인 
                → 포함된 모든 세션 정원 확인 (핵심!)
                → 모집 상태 OPEN 확인
                → soldCount + currentAttendees 증가
                → 주문 생성
```

### 4-5. 주문 생성 상세 플로우

```mermaid
sequenceDiagram
    actor User
    participant Controller as OrderController
    participant Service as OrderService
    participant TicketPort as TicketRepositoryPort
    participant SessionPort as SessionPort
    participant OrderPort as OrderRepositoryPort

    User->>Controller: POST /orders { ticketId, quantity }
    Controller->>Service: createOrder(userId, ticketId, quantity)
    
    Service->>TicketPort: findById(ticketId)
    TicketPort-->>Service: Ticket
    
    Note over Service: 1. 티켓 판매 기간 확인 (isOnSale?)
    Note over Service: 2. 티켓 수량 확인 (hasStock?)
    
    Service->>SessionPort: findSessionsByTicket(ticket)
    SessionPort-->>Service: List<Session>
    
    Note over Service: 3. 모든 세션 모집 상태 OPEN 확인
    Note over Service: 4. 모든 세션 정원 확인 (hasCapacity?)
    
    Service->>TicketPort: incrementSoldCount(quantity)
    Service->>SessionPort: incrementAttendees(sessions, quantity)
    Service->>OrderPort: save(order)
    
    Service-->>Controller: CreateOrderResponse
    Controller-->>User: 200 OK
```

### 4-6. DB 마이그레이션

```sql
-- Order 테이블
ALTER TABLE orders DROP COLUMN IF EXISTS session_id;
ALTER TABLE orders ADD COLUMN ticket_id BIGINT REFERENCES tickets(id);

-- Cart 테이블
ALTER TABLE cart DROP COLUMN IF EXISTS event_id;
ALTER TABLE cart ADD COLUMN ticket_id BIGINT REFERENCES tickets(id);
```

### Phase 4 체크리스트

- [ ] `OrderJpaEntity.java` — session → ticket 참조 변경
- [ ] `CartJpaEntity.java` — event → ticket 참조 변경
- [ ] `CreateOrderRequest.java` — eventId/sessionId → ticketId
- [ ] `Order.java` 도메인 모델 업데이트
- [ ] `Cart.java` 도메인 모델 업데이트
- [ ] `OrderService.java` — 주문 생성 로직 변경 (티켓 → 세션 정원 확인)
- [ ] `CartService.java` — 장바구니 추가 로직 변경
- [ ] `LoadEventInfoPort.java` (cart) — ticketId 기반으로 변경
- [ ] `EventInfoAdapter.java` (cart) — 어댑터 수정
- [ ] DB 마이그레이션
- [ ] 컴파일 + API 테스트

---

## Phase 5. 프론트엔드 연동

### 5-1. 이벤트 생성 폼 (Step 구조 변경)

```
Step 1 — 기본 정보 (기존 유지)
  - 제목, 카테고리, 유형, 썸네일, 설명 (Rich Editor)

Step 2 — 세션 구성 (변경)
  - 세션별: 제목, 시작/종료 시각, 장소, 지역, 온라인 여부, 정원
  - 세션별: 모집 시작일, 모집 마감일
  - hasSession 토글로 단일/다중 전환

Step 3 — 티켓 설정 (🆕 변경)
  - 기존 "가격 + 할인" → "티켓 CRUD"
  - 티켓 추가 UI: 이름, 가격, 정가, 수량 제한, 판매 기간
  - 세션 매핑: isAllSessions 토글 or 개별 세션 선택
  - 무료 이벤트 → 티켓 가격 0원

Step 4 — 미리보기 + 게시 (유지)
```

### 5-2. 이벤트 상세 페이지 변경

```
기존: 
  - event.price, event.discountedPrice 표시
  - "수강 신청" 버튼 → 주문 모달

변경:
  - tickets[] 목록 표시 (이름, 가격, 정가, 할인율, 잔여수량)
  - 티켓 선택 → "수강 신청" → ticketId 기반 주문
  - 세션별 recruitmentStatus 표시
  - 이벤트 레벨 status: Computed (ONGOING 등)
```

### 5-3. API 호출 변경

| 기존 | 변경 |
|------|------|
| `POST /orders { eventId }` | `POST /orders { ticketId }` |
| `POST /cart { eventId }` | `POST /cart { ticketId }` |
| `GET /events/{id}` 응답의 `price` | `tickets[]` 배열로 변경 |

### Phase 5 체크리스트

- [ ] 이벤트 생성 폼 Step 2 수정 (세션에 모집 기간 추가)
- [ ] 이벤트 생성 폼 Step 3 변경 (티켓 CRUD UI)
- [ ] 이벤트 상세 페이지 — 티켓 목록 + 선택 UI
- [ ] 주문 API 호출: eventId → ticketId
- [ ] 장바구니 API 호출: eventId → ticketId
- [ ] 이벤트 목록 카드 — minPrice / 할인 표시 로직 수정
- [ ] 호스트 대시보드 — 티켓별 판매 현황

---

## 📌 전체 작업 흐름도

```mermaid
flowchart TD
    Start["시작"] --> P1

    subgraph P1["Phase 1: Event 도메인 정리"]
        P1A["PurchaseType 삭제"] --> P1B["EventStatus 수정"]
        P1B --> P1C["RecruitmentStatus 생성"]
        P1C --> P1D["Event.java 필드 제거"]
        P1D --> P1E["EventJpaEntity 컬럼 제거"]
        P1E --> P1F["Mapper/DTO/Service 수정"]
        P1F --> P1G["DB 마이그레이션"]
        P1G --> P1H["컴파일 확인"]
    end

    P1H --> P2

    subgraph P2["Phase 2: Session 리팩토링"]
        P2A["EventSession → Session 리네이밍"] --> P2B["price 제거"]
        P2B --> P2C["모집 필드 3개 추가"]
        P2C --> P2D["getRecruitmentStatus 메서드"]
        P2D --> P2E["JPA Entity 수정"]
        P2E --> P2F["Mapper/DTO/Service 수정"]
        P2F --> P2G["모집 마감 API 추가"]
        P2G --> P2H["DB 마이그레이션"]
        P2H --> P2I["컴파일 확인"]
    end

    P2I --> P3

    subgraph P3["Phase 3: Ticket 도메인 생성"]
        P3A["ticket/ 패키지 생성"] --> P3B["Ticket.java 도메인"]
        P3B --> P3C["JPA Entity 2개"]
        P3C --> P3D["Repository/Mapper/Adapter"]
        P3D --> P3E["UseCase 4개"]
        P3E --> P3F["TicketService"]
        P3F --> P3G["HostTicketController"]
        P3G --> P3H["EventCommandService에 기본 티켓 자동 생성"]
        P3H --> P3I["DB 마이그레이션"]
        P3I --> P3J["컴파일 + API 테스트"]
    end

    P3J --> P4

    subgraph P4["Phase 4: Order/Cart 연동"]
        P4A["Order: sessionId → ticketId"] --> P4B["Cart: eventId → ticketId"]
        P4B --> P4C["CreateOrderRequest 수정"]
        P4C --> P4D["OrderService 주문 로직 변경"]
        P4D --> P4E["CartService 장바구니 로직 변경"]
        P4E --> P4F["DB 마이그레이션"]
        P4F --> P4G["컴파일 + E2E 테스트"]
    end

    P4G --> P5

    subgraph P5["Phase 5: 프론트엔드 연동"]
        P5A["이벤트 생성 폼 수정"] --> P5B["이벤트 상세 페이지 수정"]
        P5B --> P5C["주문/장바구니 API 호출 변경"]
        P5C --> P5D["이벤트 목록 카드 수정"]
        P5D --> P5E["통합 테스트"]
    end

    P5 --> Done["완료"]
```

---

## 📌 주의사항

> [!WARNING]
> **Phase 순서를 반드시 지켜야 함.** Phase 1~2(Event/Session 정리)가 완료되어야 Phase 3(Ticket 생성)에서 참조 가능하고, Phase 3이 완료되어야 Phase 4(Order/Cart 연동)가 가능하다.

> [!IMPORTANT]
> **기존 데이터 마이그레이션:** 운영 데이터가 있을 경우 컬럼 제거 전에 데이터 이관 스크립트가 필요하다. 개발 환경에서는 DDL 직접 변경으로 충분.

> [!NOTE]
> **브랜치 전략:** 각 Phase별로 브랜치를 분리하거나, 전체를 하나의 feature 브랜치에서 작업 후 한 번에 PR하는 것을 권장.
