import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 환경변수를 명시적으로 설정 (빌드 타임에 주입 보장)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;

