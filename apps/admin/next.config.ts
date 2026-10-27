import type {NextConfig} from 'next';

// 실제 운영자 화면과 격리 브라우저 검증이 같은 빌드 캐시와 개발 서버 잠금을
// 공유하면 한쪽의 갱신이 다른 쪽 브라우저를 다시 불러올 수 있다.
const config:NextConfig={
  distDir:process.env.NEXT_DIST_DIR??'.next',
  transpilePackages:['@cex/ui','@cex/bff'],
};
export default config;
