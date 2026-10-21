import {defineConfig} from '@playwright/test';

/** 실행 중인 3003 서버나 8080 플랫폼을 사용하지 않는 브라우저 검증이다. */
export default defineConfig({
  testDir:'./e2e',workers:1,fullyParallel:false,
  use:{baseURL:'http://127.0.0.1:3103',headless:true,channel:'chrome',viewport:{width:1440,height:1000}},
  webServer:{command:'npx next dev --hostname 127.0.0.1 --port 3103',url:'http://127.0.0.1:3103',reuseExistingServer:false,timeout:120000,
    env:{NEXT_DIST_DIR:'.next-market-test',NEXT_PUBLIC_PLATFORM_URL:'http://platform.invalid'}},
});
