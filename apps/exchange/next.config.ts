import type { NextConfig } from "next";

// 배포의 /api·/ws 라우팅은 공통 리버스 프록시에서 플랫폼으로 연결한다.
const nextConfig: NextConfig = {
  // 격리 브라우저 검증은 실행 중인 로컬 서버의 빌드 디렉터리를 공유하지 않는다.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  transpilePackages: ['@cex/ui','@cex/bff'],
};
export default nextConfig;
