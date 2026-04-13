import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";
import Script from "next/script";

export const metadata: Metadata = {
  title: "VenueOn — 세션 중계 플랫폼",
  description:
    "유료·무료 세션를 탐색하고, 티켓을 구매하고, 커뮤니티에 참여하세요.",
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
        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
