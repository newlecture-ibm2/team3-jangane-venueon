## 🐛 배포 빌드 에러 수정 (Module not found)

CI/CD 파이프라인에서 `next build` 실패하던 3개 에러를 수정했습니다.

### 원인
`CommunityCommentItem.tsx`, `CommunityPostItem.tsx`에서 `UserProfile`과 `PopoverMenu`를 `./`(같은 디렉토리 상대경로)로 import하고 있었으나, 실제 파일은 `src/components/ui/`에만 존재했습니다.
단희님이 공용 컴포넌트 폴더에 만들어두고 import 경로를 실수로 상대경로(`./`)로 적은 것으로 확인되었습니다.

추가로, `header-test/page.tsx`가 리팩토링 이전의 Header props 인터페이스를 사용하고 있어 TypeScript 타입 체크에서 실패했습니다.

### 왜 로컬에서는 됐는데 CI/CD에서만 터졌나?

| 환경 | 동작 방식 | 결과 |
|------|-----------|------|
| `npm run dev` (로컬) | **Lazy 컴파일** — 브라우저에서 실제 접속한 페이지만 그때그때 컴파일 | `/community`, `/ui-test` 페이지에 직접 접속하지 않았으므로 에러 미발생 |
| `npm run build` (CI/CD) | **전체 컴파일** — 모든 페이지, 모든 컴포넌트를 한꺼번에 빌드 | `/ui-test` → `CommunityCommentItem` → `./PopoverMenu` → 파일 없음 → **빌드 실패** |

즉, 로컬에서 해당 페이지에 한 번도 접속하지 않았기 때문에 에러를 모르고 지나간 것이고, CI/CD는 배포용으로 전체를 빌드하면서 숨어있던 에러가 드러난 것입니다.

### 해결
- `CommunityCommentItem.tsx`: `./UserProfile` → `@/components/ui/UserProfile`, `./PopoverMenu` → `@/components/ui/PopoverMenu`
- `CommunityPostItem.tsx`: `./UserProfile` → `@/components/ui/UserProfile`
- `header-test/page.tsx`: 더 이상 유효하지 않은 레거시 테스트 페이지 삭제

### 검증
로컬 `next build` 성공 확인 ✅
