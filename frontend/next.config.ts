import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ⭐ Docker 이미지 최적화
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        // 핵심: /upload/ 경로를 바로 백엔드로 보내지 않고 BFF(/api/upload)를 거치게 하여 JWT를 주입함
        source: "/upload/:path*",
        destination: "/api/upload/:path*",
      },
      {
        source: "/images/:path*",
        destination: "/api/upload/:path*",
      },
    ];
  },
};

export default nextConfig;
