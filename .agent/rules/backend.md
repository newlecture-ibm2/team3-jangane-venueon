# 백엔드 규칙 — VenueOn Spring Boot

## 기술 스택
- Spring Boot 3.x, Java 17, PostgreSQL 15, Redis 7
- Hexagonal Architecture (Ports & Adapters)
- Actor 중심 패키지 구조: Core Domain + Actor Layer (host, admin, manager)

## 패키지 구조 원칙

### Core Domain Layer (`com.venueon.{domain}/`)
- 모든 사용자가 사용하는 **공통 기능** (주로 R 조회)
- 도메인 모델, Port, Repository, 공개 Controller 위치
- 모듈: event, session, ticket, post, comment, community, order, cart, wishlist, review, report, category, user, member, contact, badge, notification, notice, common

### Actor Layer (`com.venueon.{actor}.{domain}/`)
- 특정 Actor 전용 기능 → `{actor}/{domain}/` 하위에 배치
- **host/** — event CUD, session CUD, ticket CUD, order 대시보드
- **admin/** — user, category, report, contact, post, comment, event 관리
- **manager/** — post, comment, community, member (communityId 스코프 한정)
- Actor 유즈케이스는 **Core 도메인 엔티티를 주입**받아 사용 (엔티티/리포지토리 중복 정의 금지)

## 헥사고날 아키텍처 불변 원칙

1. **Domain은 순수 POJO** — JPA/Spring 어노테이션 없음
2. **Port(Out)은 도메인 모델만 반환** — JPA Entity 반환 금지
3. **Service는 Port를 통해서만 DB 접근** — JPA Repository 직접 참조 금지
4. **Controller DTO와 Service DTO 분리** — Web DTO는 `adapter/in/web/dto/`에
5. **모듈 간 소통은 Port(인터페이스)를 통해서만**

## 표준 모듈 구조
```
module-name/
├── domain/model/           ← 순수 POJO (비즈니스 로직 포함)
├── application/
│   ├── port/in/            ← UseCase 인터페이스
│   ├── port/out/           ← RepositoryPort (도메인 모델만 반환!)
│   └── service/            ← UseCase 구현체 (Port만 의존!)
└── adapter/
    ├── in/web/             ← Controller + dto/{request, response}
    └── out/persistence/    ← JpaEntity, JpaRepository, PersistenceAdapter
```

## 네이밍 규칙
- **UseCase:** `{동작}{도메인}UseCase` (CreateEventUseCase)
- **Service:** `{도메인}{Query|Command}Service` (EventQueryService)
- **Port(Out):** `{도메인}RepositoryPort` (EventRepositoryPort)
- **Controller:** `{Actor}{도메인}Controller` (HostEventController, AdminUserController)
- **Adapter:** `{도메인}PersistenceAdapter` (EventPersistenceAdapter)

## API 경로 규칙
- 공통 공개 API: `GET /events`, `GET /events/{id}`, `GET /categories` 등
- Host 전용 API: `/host/events/**`, `/host/events/{id}/sessions/**`, `/host/events/{id}/tickets/**`
- Admin 전용 API: `/admin/users/**`, `/admin/reports/**`, `/admin/posts/**`
- Manager 전용 API: `/manager/communities/{cid}/posts/**`
- 백엔드 경로에 `/api` 미포함 (프론트 BFF에서만 `/api/` 접두사)

## 코드 테이블 (v7)
- 모든 상태/유형/역할은 코드 테이블 FK 참조: `event_statuses`, `event_types`, `recruitment_statuses`, `user_roles`
- API 응답: `{id, label}` 객체 (`CodeDto`)
- 상수: `CodeConstants.EVENT_STATUS_DRAFT_ID = 1L` 등

## 금지 패턴
- ❌ Service에서 JPA Repository 직접 import
- ❌ Port(Out)에서 JPA Entity 반환
- ❌ Domain 모델 없이 JPA Entity가 도메인 역할 겸임
- ❌ Controller에서 비즈니스 로직 처리
- ❌ `findAll().stream().filter()` 패턴 (DB 쿼리로 필터링할 것)
- ❌ `@RequestBody Map<String, Object>` (전용 Request DTO 사용)
- ❌ `event/presentation/` 같은 비표준 폴더 (반드시 `adapter/in/web/`)
