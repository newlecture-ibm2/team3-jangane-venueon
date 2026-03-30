export default function SignupPage() {
  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 480, margin: "0 auto" }}>
      <h1>회원가입</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        기획자(HOST) 또는 일반 사용자(USER)로 가입할 수 있습니다.
      </p>
      {/* TODO: SignupForm 컴포넌트 구현 (역할 선택 포함) */}
    </div>
  );
}
