# 아키텍처 검증

프로젝트의 아키텍처 규칙 준수 여부를 전체적으로 검증합니다.

## Steps

### 1. 백엔드 헥사고날 검증
- Service에서 JPA Repository 직접 참조 여부 확인
  ```bash
  grep -rn "JpaRepository" backend/src/**/service/ --include="*.java"
  ```
- Port(Out)에서 JPA Entity 반환 여부 확인
  ```bash
  grep -rn "JpaEntity" backend/src/**/port/out/ --include="*.java"
  ```
- Controller에서 비즈니스 로직 여부 확인 (50줄 이상 메서드)
- `presentation/` 비표준 폴더 존재 여부 확인
- Actor 유즈케이스가 Core 도메인에 혼재 여부 확인
  ```bash
  grep -rn "AdminUseCase\|ManagerUseCase" backend/src/**/post/ backend/src/**/comment/ --include="*.java"
  ```

### 2. 프론트엔드 파일 크기 검증
```bash
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```
- 500줄 이상 파일 → 🚨 즉시 수정 목록 작성
- 300줄 이상 파일 → 🔴 분리 필요 목록 작성
- 150줄 이상 page.tsx의 _components/ 유무 확인:
  ```bash
  find frontend/src/app -name "page.tsx" -exec sh -c 'dir=$(dirname "{}"); has="_NO"; [ -d "$dir/_components" ] && has="_YES"; lines=$(wc -l < "{}"); echo "$lines $has {}"' \;  | sort -rn
  ```

### 3. 컴포넌트 구조 검증
- 폴더 없이 단독 파일인 컴포넌트 검색
- CSS Module 공유 여부 확인
- barrel export (index.ts) 존재 여부

### 4. API 구조 검증
- `lib/api/` 도메인별 분리 여부
- BFF route.ts 줄 수 확인

### 5. 문서 정합성 검증
- `API_스펙_v7.md`의 API 경로와 실제 Controller `@RequestMapping` 일치 여부
- `아키텍처_v7.md`의 모듈 목록과 실제 패키지 구조 일치 여부
- `ERD_v7.md`의 테이블-모듈 매핑과 실제 JPA Entity 위치 일치 여부

### 6. 결과 리포트
- 위반 사항을 등급별로 분류 (🚨/🔴/🟠/🟡)
- 각 위반에 대한 수정 방안 제안
- 우선순위별 리팩토링 계획 수립
