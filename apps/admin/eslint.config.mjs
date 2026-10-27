import {defineConfig,globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// 브라우저 검증의 격리 빌드 결과는 생성 코드이므로 운영자 소스 검사에서 제외한다.
export default defineConfig([...nextVitals,...nextTs,globalIgnores(['.next/**','.next-admin-*/**','next-env.d.ts'])]);
