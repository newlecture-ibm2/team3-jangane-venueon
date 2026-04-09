import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone", // ⭐ Docker 이미지 최적화
  async rewrites() {
    return [
      // 로컬 개발: /upload/* → 백엔드 프록시 (Spring이 서빙)
      // 배포: Nginx가 /upload/* 를 먼저 가로채므로 이 rewrite 무시됨
      {
        source: "/upload/:path*",
        destination: `${backendUrl}/upload/:path*`,
      }
    ];
  },
};

export default nextConfig;
