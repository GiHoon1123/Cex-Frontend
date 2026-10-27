# 개발 화면 무한 새로고침을 차단하기

거래 화면이 차트를 표시하기 전에 반복해서 새로고침되던 원인을 브라우저와 개발 서버 메시지로 확인하고, 고객·운영자 개발 서버를 안정적인 갱신 경로로 고정한 과정을 설명한다.

## 문제와 기존 동작

`http://localhost:3003`을 새 브라우저에서 열어도 5초 동안 메인 문서 이동이 25회, 기준 봉 요청이 96회 발생했다. 기준 봉 API 자체는 200 응답과 500개 봉을 정상 반환했지만, 문서가 먼저 사라져 요청이 `net::ERR_ABORTED`로 취소됐다. 그 결과 화면에는 `기준 시세를 불러오는 중입니다.`만 반복해서 보였다.

크롬 개발자 프로토콜로 문서 이동의 호출자를 확인하니 애플리케이션의 로그인·로그아웃 코드가 아니라 Next 개발 클라이언트의 `restart → handleApply → triggerUpdate`였다. 개발 서버 WebSocket은 매번 `restart`와 `reloadPage: HMR hash mismatch`를 보냈다. 따라서 Binance 장애나 차트 상태 갱신을 원인으로 추측해 우회하지 않고 개발 번들러의 갱신 루프를 수정했다.

## 기존 제품과 공식 자료의 접근

Next.js 16은 개발 번들러로 Turbopack을 기본 사용하지만, [공식 Next CLI 문서](https://nextjs.org/docs/app/api-reference/cli/next)는 문제가 있는 개발 환경에서 `next dev --webpack`으로 Webpack을 명시적으로 선택하는 경로를 제공한다. 별도 브라우저 검증 서버는 `distDir`을 분리해 실행 중인 로컬 서버의 캐시와 잠금도 공유하지 않는다.

## 선택과 트레이드오프

고객·운영자 개발 서버만 Webpack으로 고정했다. Turbopack의 빠른 증분 빌드 이점은 포기하지만, 실제로 관측한 해시 불일치가 금융 화면을 계속 재기동하는 위험을 제거한다. 제품 빌드는 기존 Next 빌드 경로를 유지하므로 이 선택은 배포 번들 구조를 바꾸지 않는다.

단순 캐시 삭제와 재시작만으로 현재 증상은 사라졌지만 다시 같은 상태가 만들어질 수 있어 그것만 해결책으로 삼지 않았다. 반대로 애플리케이션의 정상적인 차트 재조회나 인증 새로고침을 제거하면 개발 서버 문제를 숨기는 동시에 실제 기능을 잃으므로 건드리지 않았다.

## 구현과 관련 코드

[고객 앱 실행 설정](../../apps/exchange/package.json)과 [운영자 앱 실행 설정](../../apps/admin/package.json)은 다음처럼 같은 개발 번들러를 사용한다.

```json
"dev": "next dev --webpack -p 3003"
```

`--webpack`은 Next CLI가 지원하는 개발 번들러 선택값이다. 고객 앱은 3003, 운영자 앱은 3004라는 기존 실행 경계를 그대로 유지한다.

[운영자 Next 설정](../../apps/admin/next.config.ts)에도 고객 앱과 같은 출력 격리를 추가했다.

```ts
const config:NextConfig={
  distDir:process.env.NEXT_DIST_DIR??'.next',
  transpilePackages:['@cex/ui','@cex/bff'],
};
```

일반 실행은 `.next`를 쓰고 브라우저 검증은 `NEXT_DIST_DIR=.next-admin-test`를 사용한다. null 병합 연산자 `??`는 환경 변수가 없을 때만 기본값을 선택한다. 두 개발 서버가 같은 앱의 캐시와 잠금을 공유하지 않아 검증 실행이 사용자가 보고 있는 화면을 갱신하지 않는다.

## 작성한 테스트

- `e2e/exchange.spec.ts`의 `플랫폼이 중계한 Binance 기준 봉을 그리고 브라우저가 Binance를 직접 호출하지 않는다`
  - 차트 캔버스가 준비된 시점의 메인 프레임 이동 횟수를 저장한다.
  - 여덟 기간을 선택하고 1초를 더 기다린 뒤 문서 전체 이동 횟수가 늘지 않았는지 확인한다.
  - 차트 API 요청과 화면 상태 갱신은 허용하면서 HMR 전체 새로고침만 회귀로 검출한다.

## 실행 명령과 결과

```text
npm run lint                                                     통과
npm test                                                         17개 통과
npm run test:e2e                                                 9개 통과
NEXT_DIST_DIR=.next-reload-fix-build npm run build --workspace @cex/exchange  통과
NEXT_DIST_DIR=.next-reload-fix-build npm run build --workspace @cex/admin     통과
```

실제 3003 서버를 Webpack으로 다시 띄운 뒤 Chrome을 18초 동안 유지했다. 메인 문서 이동은 최초 1회, 기준 봉 응답은 모두 200, 표시 중 문구와 브라우저 실행 오류는 0건이었다. 15초 기준 봉 갱신 뒤에도 차트가 유지됐다.

## 관련 커밋과 참고 자료

- [Next.js CLI의 `--webpack` 선택](https://nextjs.org/docs/app/api-reference/cli/next)
- [차트 기간과 반응형 화면 결정](009-responsive-chart-periods.md)
