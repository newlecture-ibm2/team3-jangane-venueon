# 백엔드 모듈 생성

새로운 백엔드 모듈(도메인 또는 Actor 하위 도메인)을 헥사고날 아키텍처에 맞게 생성합니다.

## Steps

### 1. 도메인 모델 생성
- `domain/model/` 폴더에 순수 POJO 도메인 모델 생성
- JPA 어노테이션 없음
- 비즈니스 행위 메서드 포함 (상태 변경, 검증 등)
- Builder 패턴 + 상태 변경 메서드 함께 추가

### 2. Port(In) 생성
- `application/port/in/` 에 UseCase 인터페이스 정의
- 네이밍: `{동작}{도메인}UseCase` (예: `CreateEventUseCase`)
- CQRS 분리: Query는 `Get{도메인}Query`, Command는 `{동작}{도메인}UseCase`

### 3. Port(Out) 생성
- `application/port/out/` 에 RepositoryPort 인터페이스 정의
- 반환 타입이 **도메인 모델**인지 확인 (JPA Entity 반환 금지!)
- 네이밍: `{도메인}RepositoryPort`

### 4. Service 생성
- `application/service/` 에 UseCase 구현체 생성
- **Port만 의존** (`import`에 `adapter.out.persistence`가 없는지 확인!)
- 단일 메서드 50줄 이하
- 네이밍: `{도메인}{Query|Command}Service`

### 5. Controller 생성
- `adapter/in/web/` 에 Controller 생성
- UseCase 인터페이스에만 의존
- DTO는 `dto/request/`, `dto/response/`에 별도 파일로
- Controller에 비즈니스 로직 없음
- 네이밍: `{Actor}{도메인}Controller` (예: `HostEventController`)

### 6. JPA 인프라 생성
- `adapter/out/persistence/` 에 구현체 생성:
  - `{도메인}JpaEntity.java` — JPA 어노테이션은 여기에만
  - `{도메인}JpaRepository.java`
  - `{도메인}PersistenceAdapter.java` — RepositoryPort 구현, Domain ↔ Entity 매핑
  - `{도메인}Mapper.java` — 양방향 매핑 (선택)

### 7. Actor 모듈인 경우 추가 확인
- Actor 코어 도메인의 Port를 주입받았는지 확인
- 엔티티/리포지토리를 중복 정의하지 않았는지 확인
- API 경로가 Actor 접두사를 사용하는지 확인 (`/host/...`, `/admin/...`)

### 8. 검증
```bash
./gradlew compileJava
./gradlew test
```
