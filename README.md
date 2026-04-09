# 🎭 VenueOn (베뉴온) - 이벤트 관리 플랫폼

VenueOn은 다양한 이벤트의 개최, 참여 및 관련 커뮤니티 기능을 제공하는 플랫폼입니다. 이 문서는 프로젝트의 초기 설정 및 로컬 환경 실행 방법을 안내합니다.

---

## 🛠 기술 스택

### **Backend**
- **Language:** Java 21
- **Framework:** Spring Boot 3.x (또는 4.x)
- **Build Tool:** Gradle
- **Database:** PostgreSQL 15

### **Frontend**
- **Language:** TypeScript
- **Library:** Next.js 14+ (App Router)
- **Styling:** CSS Modules / Vanilla CSS
- **Package Manager:** npm

---

## 🚀 시작하기 (Local Setup)

프로젝트를 로컬에서 실행하기 위해 아래 단계들을 차례대로 진행해주세요.

### 1. 필수 요구사항
명령어를 실행하기 전 아래 도구들이 설치되어 있어야 합니다.
- **Docker & Docker Compose**
- **JDK 21**
- **Node.js (v18+)**
- **npm**

### 2. 환경 변수 설정
루트 디렉토리에 `.env` 파일을 만들고 필요한 값을 설정해야 합니다. `.env.example` 파일을 복사하여 사용할 수 있습니다.

```bash
cp .env.example .env
```

### 3. 데이터베이스 실행 (Docker)
로컬 개발에 필요한 PostgreSQL 데이터베이스를 실행합니다.

```bash
docker-compose -f docker-compose.local.yml up -d
```

### 4. 백엔드(Backend) 설정 및 실행
백엔드 서버는 루트 디렉토리의 `.env` 파일을 자동으로 읽도록 설정되어 있습니다 (`spring.config.import`).

```bash
cd backend
./gradlew bootRun
```
- **API URL:** `http://localhost:8080`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **특이사항:** `application-dev.properties`가 기본으로 활성화되어 있으며, 이미지는 `backend/upload` 폴더에 저장됩니다.

### 5. 프론트엔드(Frontend) 설정 및 실행
프론트엔드는 Next.js를 사용하며, API 요청은 기본적으로 `http://localhost:8080`으로 프록시/리라이트 설정이 되어 있습니다.

```bash
cd frontend
npm install
npm run dev
```
- **Web URL:** `http://localhost:3000` (또는 `.env` 설정에 따름)

---

## 🔗 주요 페이지 URL 목록 (테스트용)

현재 페이지 간 링크 연결이 완벽하지 않을 수 있으므로, 아래 URL을 직접 입력하여 테스트하실 수 있습니다. (기본 포트: `3000` 가정)

### 👤 사용자 페이지
- **메인**: `http://localhost:3000/`
- **로그인/회원가입**:
  - 로그인: `/login`
  - 일반 회원가입: `/signup`
  - 호스트 회원가입: `/host-signup`
- **이벤트(공연/행사)**:
  - 목록: `/events`
  - 상세: `/events/{id}` (예: `/events/1`)
  - 등록(호스트용): `/events/new`
- **커뮤니티**:
  - 목록: `/community`
  - 상세: `/community/{id}` (예: `/community/1`)
  - 작성: `/community/create`
  - 북마크 목록 데이터 테스트: `/api/posts/bookmarks/me`
- **마이페이지**:
  - 대시보드: `/mypage`
  - 프로필 관리: `/mypage/profile`
  - 내 이벤트 (참여 중): `/mypage/events`
  - 내 주문/예약 목록: `/mypage/orders`
  - 주문 내역 상세: `/mypage/orders/{id}` (예: `/mypage/orders/1`)
  - 가입한 커뮤니티: `/mypage/community`
  - 비밀번호 변경/보안: `/mypage/security`
  - 찜 목록: `/mypage/wishlist`
- **장바구니**: `/cart`

### 👑 관리자 및 호스트
- **호스트 대시보드**: `/host`
- **관리자 대시보드**: `/admin`
- **관리자 유저 관리**: `/admin/users`
- **관리자 시스템 설정**: `/admin/settings`

### 🧪 개발 및 테스트용
- **UI 컴포넌트 테스트**: `/ui-test`
- **사이드바 레이아웃 테스트**: `/sidebar-test`

---

## 📁 프로젝트 구조

```text
.
├── backend          # Spring Boot 소스 코드
├── frontend         # Next.js 소스 코드
├── docs             # 문서 및 기획 자료
├── docker-compose.local.yml  # 로컬 DB 설정
└── .env             # 환경 변수 필드
```

---

## 📝 주요 기능
- **이벤트 관리**: 다양한 이벤트의 등록, 검색 및 정보 조회
- **티켓팅/결제**: 실시간 참여 신청 및 결제 (Toss Payments 연동)
- **커뮤니티**: 이벤트 관련 공지사항 및 사용자 게시판
- **마이페이지**: 개인별 이벤트 스케줄 및 활동 로그 관리

---

## 🤝 기여 방법
1. 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
2. 변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
3. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
4. Pull Request를 생성합니다.
