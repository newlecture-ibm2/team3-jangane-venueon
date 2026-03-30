import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone", // ⭐ Docker 이미지 최적화
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${backendUrl}/v1/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${backendUrl}/images/:path*`,
      },
      // 백엔드 경로 추가 시 여기에 명시적으로 추가
    ];
  },
};

export default nextConfig;
