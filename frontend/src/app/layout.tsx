import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "VenueOn — 이벤트 중계 플랫폼",
  description:
    "유료·무료 이벤트를 탐색하고, 티켓을 구매하고, 커뮤니티에 참여하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// ── 임시 Header / Footer (추후 components/ 분리) ──
function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-4) var(--space-8)",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <a href="/" style={{ fontSize: "var(--font-size-xl)", fontWeight: 700 }}>
        VenueOn
      </a>
      <nav style={{ display: "flex", gap: "var(--space-4)" }}>
        <a href="/events">이벤트</a>
        <a href="/community">커뮤니티</a>
        <a href="/mypage">마이페이지</a>
        <a href="/auth/login">로그인</a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "var(--space-6)",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      © 2026 VenueOn. All rights reserved.
    </footer>
  );
}
