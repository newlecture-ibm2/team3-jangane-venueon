import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Toast from "@/components/ui/Toast";

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
        <Toast />
      </body>
    </html>
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
