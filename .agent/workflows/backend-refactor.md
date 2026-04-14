# 백엔드 리팩토링

기존 백엔드 코드를 Actor 중심 헥사고날 아키텍처로 리팩토링합니다.

## Steps

### 1. 현재 상태 분석
- 대상 모듈의 현재 디렉토리 구조 확인
- 위반 사항 식별:
  - Service에서 JPA Repository 직접 참조?
  - Port(Out)이 JPA Entity를 반환?
  - Domain 모델이 없거나 빈혈(Anemic)?
  - Port(Out)/PersistenceAdapter 누락?
  - Controller에 비즈니스 로직?
  - presentation/ 같은 비표준 폴더?
  - Actor 유즈케이스가 Core 도메인 안에 혼재?

### 2. Actor 분리 필요성 판단
- Host 전용 CUD → `host/{domain}/` 으로 이동
- Admin 전용 관리 → `admin/{domain}/` 으로 이동
- Manager 커뮤니티 관리 → `manager/{domain}/` 으로 이동
- 공통 R(조회) → Core `{domain}/` 에 유지

### 3. 파일 이동 계획 수립
- `docs/Architecture/BE 리팩토링 설계서.md`의 §4-1 매핑 테이블 참조
- import 경로 영향 범위 파악
- 네이밍 정규화 필요 여부 확인

### 4. 구조 리팩토링 실행
- Phase 순서 준수:
  1. Port(Out) + PersistenceAdapter 보완 → 가장 먼저
  2. Domain 모델 행위 추가 + DTO 분리
  3. Service의 JPA 직접 참조 → Port 전환
  4. Controller를 `adapter/in/web/`로 이동
  5. Actor 패키지 분리

### 5. 검증
```bash
./gradlew compileJava
./gradlew test
```
- `import ...adapter.out.persistence.*`가 Service에 없는지 확인
- Port 반환 타입이 도메인 모델인지 확인
- Actor → Core 방향 의존만 존재하는지 확인
