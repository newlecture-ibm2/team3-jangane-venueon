# 📧 이메일 인증 구현 계획서

> **방식:** 6자리 숫자 코드 | **SMTP:** Gmail (무료) | **저장:** In-Memory ConcurrentHashMap

---

## 전체 플로우

```
[회원가입 폼] → 이메일 입력 → [인증 요청] 버튼 클릭
       ↓
[FE] POST /api/auth/send-code { email }
       ↓
[BFF] → POST /auth/email/send-code → [BE]
       ↓
[BE] 6자리 랜덤 코드 생성 → ConcurrentHashMap 저장 (5분 TTL) → Gmail SMTP 발송
       ↓
[사용자] 메일에서 인증코드 확인 → 회원가입 폼에 코드 입력
       ↓
[FE] POST /api/auth/verify-code { email, code }
       ↓
[BFF] → POST /auth/email/verify-code → [BE]
       ↓
[BE] 코드 일치 + 만료 확인 → { verified: true } 반환
       ↓
[FE] 인증 완료 표시 → 나머지 폼 작성 → 회원가입 제출
```

---

## 1. 백엔드 작업

### 1-1. 의존성 추가 (`build.gradle`)

```groovy
// Mail
implementation 'org.springframework.boot:spring-boot-starter-mail'
```

### 1-2. SMTP 설정 (`application-dev.properties`)

```properties
# Gmail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${GMAIL_USERNAME}
spring.mail.password=${GMAIL_APP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

> **Gmail 앱 비밀번호 발급 방법:**
> 1. Google 계정 → 보안 → 2단계 인증 활성화
> 2. 보안 → 앱 비밀번호 → "메일" 선택 → 16자리 비밀번호 발급
> 3. 해당 비밀번호를 `GMAIL_APP_PASSWORD` 환경변수로 설정

### 1-3. 도메인 모델

```
user/
├── domain/
│   └── model/
│       └── EmailVerification.java   ← NEW: 순수 POJO
```

```java
// EmailVerification.java
public class EmailVerification {
    private final String email;
    private final String code;          // 6자리 숫자
    private final LocalDateTime expiresAt;  // 생성 시각 + 5분
    private boolean verified;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean verify(String inputCode) {
        if (isExpired()) return false;
        if (!this.code.equals(inputCode)) return false;
        this.verified = true;
        return true;
    }
}
```

### 1-4. 포트 (헥사고날 아키텍처)

```
user/
├── application/
│   ├── port/
│   │   ├── in/
│   │   │   ├── SendVerificationCodeUseCase.java   ← NEW
│   │   │   └── VerifyCodeUseCase.java             ← NEW
│   │   └── out/
│   │       └── EmailSendPort.java                 ← NEW (메일 발송 추상화)
```

```java
// SendVerificationCodeUseCase.java
public interface SendVerificationCodeUseCase {
    void sendCode(String email);
}

// VerifyCodeUseCase.java
public interface VerifyCodeUseCase {
    boolean verifyCode(String email, String code);
}

// EmailSendPort.java (Port Out)
public interface EmailSendPort {
    void sendVerificationEmail(String to, String code);
}
```

### 1-5. 서비스

```
user/
├── application/
│   └── service/
│       └── EmailVerificationService.java   ← NEW
```

```java
@UseCase
public class EmailVerificationService
        implements SendVerificationCodeUseCase, VerifyCodeUseCase {

    private final EmailSendPort emailSendPort;
    private final UserRepositoryPort userRepositoryPort;

    // In-Memory 저장소 (추후 Redis로 교체 가능)
    private final ConcurrentHashMap<String, EmailVerification> store = new ConcurrentHashMap<>();

    @Override
    public void sendCode(String email) {
        // 1. 이메일 중복 체크
        if (userRepositoryPort.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다.");
        }

        // 2. 6자리 코드 생성
        String code = String.format("%06d", new Random().nextInt(1_000_000));

        // 3. 저장 (5분 TTL)
        store.put(email, new EmailVerification(email, code, LocalDateTime.now().plusMinutes(5)));

        // 4. 메일 발송
        emailSendPort.sendVerificationEmail(email, code);
    }

    @Override
    public boolean verifyCode(String email, String code) {
        EmailVerification verification = store.get(email);
        if (verification == null) return false;

        boolean result = verification.verify(code);
        if (result) {
            store.remove(email);  // 인증 완료 후 삭제
        }
        return result;
    }
}
```

### 1-6. 어댑터

```
user/
├── adapter/
│   ├── in/web/
│   │   └── EmailVerificationController.java   ← NEW
│   │   └── dto/
│   │       ├── SendCodeRequest.java           ← NEW
│   │       └── VerifyCodeRequest.java         ← NEW
│   └── out/
│       └── mail/
│           └── EmailSendAdapter.java          ← NEW (JavaMailSender 사용)
```

```java
// EmailSendAdapter.java
@Component
@RequiredArgsConstructor
public class EmailSendAdapter implements EmailSendPort {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[VenueOn] 이메일 인증 코드");
        message.setText("인증 코드: " + code + "\n\n5분 내에 입력해 주세요.");
        mailSender.send(message);
    }
}
```

```java
// EmailVerificationController.java
@RestController
@RequestMapping("/auth/email")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final SendVerificationCodeUseCase sendCodeUseCase;
    private final VerifyCodeUseCase verifyCodeUseCase;

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@RequestBody SendCodeRequest request) {
        sendCodeUseCase.sendCode(request.email());
        return ResponseEntity.ok(Map.of("message", "인증 코드가 발송되었습니다."));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        boolean verified = verifyCodeUseCase.verifyCode(request.email(), request.code());
        return ResponseEntity.ok(Map.of("verified", verified));
    }
}
```

### 1-7. SecurityConfig 허용

```java
// /auth/email/** 경로 permitAll 추가
.requestMatchers(HttpMethod.POST, "/auth/email/**").permitAll()
```

---

## 2. 프론트엔드 작업

### 2-1. BFF API 라우트

`/api/auth/send-code` 및 `/api/auth/verify-code` 프록시 추가 (기존 BFF 패턴 따름)

### 2-2. auth-api.ts 확장

```typescript
// lib/auth-api.ts 에 추가
sendVerificationCode: async (email: string) => {
  const res = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.message || '인증코드 발송 실패');
  return result;
},

verifyCode: async (email: string, code: string) => {
  const res = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.message || '인증코드 확인 실패');
  return result;
},
```

### 2-3. 회원가입 UI 변경 (`signup/page.tsx`)

**변경 전:**
```
[이메일 입력]
[이름 입력]
[비밀번호]
[비밀번호 확인]
[회원 가입] 버튼
```

**변경 후:**
```
[이메일 입력] [인증 요청] 버튼     ← 이메일 옆에 인라인 버튼
[인증코드 6자리 입력]              ← 인증 요청 후 표시
 ✅ 인증 완료                      ← 인증 성공 시 표시
[이름 입력]
[비밀번호]
[비밀번호 확인]
[회원 가입] 버튼                   ← 이메일 인증 완료 전까지 disabled
```

### 2-4. 상태 관리 (signup/page.tsx 내부)

```typescript
const [emailVerified, setEmailVerified] = useState(false);   // 인증 완료 여부
const [codeSent, setCodeSent] = useState(false);             // 코드 발송 여부
const [verificationCode, setVerificationCode] = useState(""); // 입력된 코드
const [cooldown, setCooldown] = useState(0);                 // 재발송 쿨다운 (초)
```

---

## 3. 보안 고려사항

| 항목 | 대응 |
|------|------|
| 무차별 대입(Brute Force) | 같은 이메일 5회 실패 시 15분 차단 |
| 코드 재발송 남용 | 60초 쿨다운 적용 |
| 코드 만료 | 생성 후 5분 TTL |
| 동시 다중 요청 | ConcurrentHashMap 사용 (Thread-safe) |
| 인증 없이 가입 시도 | BE에서 signUp 시 인증 완료 여부 재검증 |

---

## 4. 추후 확장 포인트

- **Redis 전환**: 서버 재시작 시 인증코드 유실 방지 → `spring-boot-starter-data-redis` 추가
- **HTML 메일 템플릿**: `SimpleMailMessage` → `MimeMessage` + Thymeleaf 템플릿
- **Rate Limiting**: Spring AOP 또는 Bucket4j 라이브러리로 API 레벨 제한

---

## 5. 작업 순서 (권장)

```
1. [BE] build.gradle에 spring-boot-starter-mail 추가
2. [BE] application-dev.properties에 Gmail SMTP 설정
3. [BE] EmailVerification 도메인 모델 생성
4. [BE] Port(In/Out) 인터페이스 정의
5. [BE] EmailVerificationService 구현
6. [BE] EmailSendAdapter 구현 (JavaMailSender)
7. [BE] EmailVerificationController + DTO 생성
8. [BE] SecurityConfig 경로 허용
9. [BE] Postman/curl 으로 API 테스트
10. [FE] auth-api.ts 확장
11. [FE] BFF 프록시 라우트 추가
12. [FE] signup/page.tsx UI 변경 (인증 버튼 + 코드 입력 필드)
13. [FE] E2E 테스트
```
