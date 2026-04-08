import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone", // ⭐ Docker 이미지 최적화
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: `${backendUrl}/upload/:path*`,
      }
    ];
  },
};

export default nextConfig;
