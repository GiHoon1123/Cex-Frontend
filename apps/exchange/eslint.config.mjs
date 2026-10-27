import {defineConfig,globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// 설치된 넥스트 공식 규칙을 사용하고 검증·빌드 산출물은 소스 검사에서 제외한다.
export default defineConfig([
  ...nextVitals,...nextTypescript,
  globalIgnores(['.next/**','.next-market-*/**','next-env.d.ts','test-results/**','playwright-report/**']),
]);
