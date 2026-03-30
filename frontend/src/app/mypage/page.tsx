export default function MyPage() {
  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1>마이페이지</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        내 프로필과 활동을 관리하세요.
      </p>
      <nav style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
        <a href="/mypage/events">내 이벤트</a>
        <a href="/mypage/tickets">구매내역</a>
        <a href="/mypage/communities">내 커뮤니티</a>
      </nav>
      {/* TODO: 프로필 섹션 + 활동 요약 */}
    </div>
  );
}
