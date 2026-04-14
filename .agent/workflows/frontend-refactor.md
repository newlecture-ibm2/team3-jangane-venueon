# 프론트엔드 리팩토링

기존 프론트엔드 코드를 아키텍처 가이드에 맞게 리팩토링합니다.

## Steps

### 1. 대상 파일 분석
- 파일 줄 수 확인 (`wc -l`)
- 위반 사항 식별:
  - page.tsx가 150줄 이상?
  - _components/ 폴더가 없는 page?
  - 300줄 이상 컴포넌트?
  - 폴더 없이 단독 파일로 존재하는 컴포넌트?
  - UI + 로직이 혼재된 거대 컴포넌트?
  - CSS Module을 다른 컴포넌트와 공유?

### 2. 분리 계획 수립
- **500줄 이상 → 즉시 분리 (🚨 아키텍처 위반)**
  - Feature Component + Custom Hook 패턴 적용
  - 서브 컴포넌트 3~5개로 분리
- **300~500줄 → 분리 필요**
  - 논리적 섹션별로 _components/ 분리
- **150~300줄 → 분리 검토**
  - _components/ 폴더 생성 + 주요 섹션 분리

### 3. 컴포넌트 분리 실행
- 각 섹션을 폴더 컴포넌트로 추출:
  ```
  _components/SectionName/
  ├── SectionName.tsx        # UI만
  ├── SectionName.module.css # 전용 CSS (기존 CSS에서 해당 부분 추출)
  └── index.ts               # re-export
  ```
- 복잡한 로직 → `use{Feature}.ts` 커스텀 훅으로 분리

### 4. 공유 컴포넌트 폴더 정리
- 단독 파일 → 폴더 구조로 전환:
  ```
  Before: components/ui/Button.tsx + Button.module.css
  After:  components/ui/Button/Button.tsx + Button.module.css + index.ts
  ```
- barrel export(`index.ts`) 갱신하여 import 경로 유지

### 5. API 함수 분리
- 거대 api.ts → 도메인별 파일로 분리
- `lib/api/{domain}API.ts` 패턴 적용
- 공통 fetch wrapper → `client.ts`

### 6. 검증
- 모든 page.tsx가 150줄 이하인지 확인
- 모든 컴포넌트가 300줄 이하인지 확인
- 모든 컴포넌트가 폴더 구조(tsx + module.css + index.ts)인지 확인
- import 경로가 모두 정상인지 확인
- `npm run build` 로 빌드 검증
