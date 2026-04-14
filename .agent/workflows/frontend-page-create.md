# 프론트엔드 페이지 생성

새로운 페이지를 프론트엔드 아키텍처 규칙에 맞게 생성합니다.

## Steps

### 1. 페이지 폴더 + _components 동시 생성
```
app/{route}/
├── page.tsx
├── page.module.css
└── _components/          ← 반드시 동시 생성!
```

### 2. page.tsx 작성
- **150줄 이하** 유지 계획
- 역할: **레이아웃 조합 + 데이터 패칭 위임**만
- 콘텐츠 패턴 클래스 적용:
  - 목록 페이지 → `container-full`
  - 상세/폼 페이지 → `container-single`
  - 대시보드 → `container-sidebar` + Sidebar import
- admin/host/mypage에서 사이드바 필요 시:
  ```tsx
  import Sidebar from '@/components/layout/Sidebar';
  <div className="container-sidebar">
    <Sidebar role="host" />
    <div className="sidebar">{/* 콘텐츠 */}</div>
  </div>
  ```

### 3. 섹션 컴포넌트 분리
- 각 섹션을 `_components/` 아래 폴더 컴포넌트로 생성:
  ```
  _components/SectionName/
  ├── SectionName.tsx
  ├── SectionName.module.css
  └── index.ts
  ```
- 각 컴포넌트는 전용 CSS Module 보유 (공유 금지)

### 4. 커스텀 훅 분리
- 복잡한 로직이 있으면 `use{Feature}.ts` 커스텀 훅으로 분리
- 훅에 담을 것: API 호출, 상태 관리, 비즈니스 로직
- 컴포넌트에 남길 것: UI 렌더링만

### 5. API 함수 확인
- 해당 도메인의 API 파일이 `lib/api/{domain}API.ts`에 있는지 확인
- 없으면 도메인별 API 파일 생성
- 공통 fetch wrapper(`client.ts`) 사용

### 6. 검증
- page.tsx 줄 수가 150줄 이하인지 확인
- 컴포넌트가 300줄 이하인지 확인
- `_components/` 폴더가 생성되었는지 확인
- 각 컴포넌트가 폴더 구조(tsx + module.css + index.ts)인지 확인
