# NCafe 로컬 개발 환경 가이드

이 문서는 NCafe 프로젝트의 로컬 개발 환경에서 코드 수정이 실시간으로 반영되는 원리와 백엔드 빌드 최적화 전략을 설명합니다.

---

## 1. 실시간 코드 반영 (Save-and-Reflect)

프로젝트는 **Docker Volume Mounting**과 각 프레임워크의 **Hot/Auto Reload** 기능을 결합하여, 파일을 저장(`Ctrl + S`)하는 즉시 별도의 명령 없이도 서버에 반영되도록 구성되었습니다.

### 🌐 프론트서버 (Next.js)
- **작동 방식**: `Next.js Fast Refresh (HMR)`
- **설정**: `docker-compose.local.yml`에서 로컬 `frontend` 폴더를 컨테이너 내 `/app`으로 마운트.
- **실행**: `npm run dev` (Next.js 개발 서버)가 파일 변경을 감지하고 브라우저의 수정한 부분만 즉시 업데이트합니다.

### 🤖 에이전트서버 (Python/FastAPI)
- **작동 방식**: `Uvicorn Auto-reload`
- **설정**: `docker-compose.local.yml`의 `command` 섹션에 `--reload` 옵션 추가.
- **실행**: 로컬 소스 수정 시 `uvicorn` 프로세스가 자동으로 파일 변화를 감지하여 서버를 재시작합니다.

### 🐘 DB 서버 (PostgreSQL)
- **작동 방식**: `Docker Volume Persistence`
- **설정**: `local-db-data` 볼륨을 통해 DB 데이터를 영구 저장.
- **효과**: 서버가 재시작되어도 DB 데이터와 스키마가 유지되어 매번 초기화할 필요가 없습니다.

---

## 2. 백엔드 빌드 최적화 (Fast Build)

백엔드(Java/Spring Boot)는 정적 컴파일 언어의 특성상 리빌드가 필요하지만, **Docker Layer Caching** 기술을 통해 빌드 시간을 극적으로 단축시켰습니다.

### ⚡ 빌드 시간이 짧은 이유 (기능적 원리)
`backend/Dockerfile`은 소스 코드보다 **의존성(Libraries)**을 먼저 처리하도록 설계되었습니다.

1.  **의존성 캐싱 (Step 1)**: `build.gradle` 등의 설정 파일만 먼저 복사하고 `./gradlew dependencies`를 실행하여 외부 라이브러리를 미리 다운로드합니다. 이 과정은 별도의 '레이어'로 캐싱됩니다.
2.  **소스 컴파일 (Step 2)**: 실제 자바 소스(`src`)는 그 이후에 복사됩니다.
3.  **효과**: 비즈니스 로직(소스 코드)만 수정했을 경우, Docker는 이미 받아놓은 라이브러리 레이어를 **그대로 재사용(Skip)**하므로 전체 빌드 시간이 수 분에서 **수 초** 수준으로 줄어듭니다.

### 🛠️ 백엔드 반영 방법
백엔드 코드를 수정한 후 아래 명령어를 실행하면 최적화된 빌드가 수행됩니다.
```bash
docker-compose -f docker-compose.local.yml up -d --build backend
```

---

## 3. 핵심 아키텍처 요약 (Summary)

| 서버 | 반영 방식 | 핵심 기술/옵션 | 파일 위치 |
| :--- | :--- | :--- | :--- |
| **Frontend** | 실시간 (HMR) | `next dev`, Docker Volume | `frontend/Dockerfile.dev` |
| **Agent** | 자동 재시작 | `uvicorn --reload`, Docker Volume | `docker-compose.local.yml` |
| **Backend** | 고속 빌드 | Docker Layer Caching | `backend/Dockerfile` |
| **DB** | 데이터 유지 | Docker Named Volume | `docker-compose.local.yml` |
