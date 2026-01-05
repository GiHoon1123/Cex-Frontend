import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 환경변수를 명시적으로 설정 (빌드 타임에 주입 보장)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Vercel rewrites: HTTPS 프론트엔드에서 HTTP 백엔드로 프록시
  // Mixed Content 에러 해결을 위해 /api/* 요청을 백엔드로 프록시
  async rewrites() {
    // 프로덕션 환경에서만 프록시 사용 (로컬은 직접 연결)
    const isProduction = process.env.NODE_ENV === "production";
    const backendUrl = process.env.BACKEND_URL || "http://52.79.139.149:3002";
    
    if (isProduction) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    
    // 개발 환경에서는 rewrites 사용 안 함 (직접 연결)
    return [];
  },
};

export default nextConfig;

