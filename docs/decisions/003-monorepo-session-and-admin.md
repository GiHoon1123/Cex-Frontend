# 고객·운영자 앱과 서버 세션 경계

단일 고객 앱을 npm workspace의 고객·운영자 앱으로 나누고, 브라우저 저장소의 인증 토큰을 Next.js 서버 중계의 `HttpOnly` 쿠키로 옮겼다. 운영자 화면은 플랫폼의 운영 상태·승인·시장감시·감사 조회만 표시하며 금융 판단을 프론트에서 만들지 않는다.

## 문제와 기존 동작

기존 앱은 고객 화면 하나였고 access/refresh token을 `localStorage`에 저장했다. 이 값은 같은 출처에서 실행된 자바스크립트가 읽을 수 있어 스크립트 삽입 취약점이 생기면 장기 세션까지 탈취될 수 있다. 운영자 앱이 없어서 플랫폼에 구현한 권한·승인·감사 업무를 시연할 경계도 없었다.

## 기존 제품과 공식 자료의 접근

- Next.js는 인증, 세션, 인가를 구분하고 서버 측에서 쿠키를 설정하며 민감한 업무는 데이터 접근 계층에서 다시 권한을 확인하도록 설명한다. [Next.js 인증 가이드](https://nextjs.org/docs/app/guides/authentication)
- OWASP는 세션 쿠키에 `HttpOnly`, `Secure`, `SameSite`를 적용하고 쿠키 인증의 상태 변경 요청에는 CSRF 방어를 함께 사용하도록 권고한다. [OWASP 세션 관리](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [OWASP CSRF 방어](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- npm workspace는 한 루트 잠금 파일에서 여러 패키지를 관리한다. 기존 npm을 유지해 별도 빌드 도구를 추가하지 않았다. [npm workspace](https://docs.npmjs.com/cli/v11/using-npm/workspaces/)

## 선택과 트레이드오프

고객과 운영자를 별도 Next.js 앱으로 두고 공통 UI와 서버 중계만 패키지로 공유했다. 각 앱은 이름이 다른 호스트 전용 쿠키를 사용한다. 플랫폼은 JWT와 역할을 최종 검증하므로 쿠키 이름은 인가 수단이 아니다.

서버 중계는 브라우저의 토큰 노출과 CORS 구성을 줄이지만 Next.js 서버가 세션 처리 경로가 되고 CSRF 검증·공개 출처 설정·쿠키 만료 관리가 필요하다. 상태 변경은 배포에서 고정한 공개 출처와 이중 제출 토큰을 모두 확인한다. 운영의 공개 출처가 없으면 요청을 거부한다. 고객 화면의 `localStorage`에는 인증 근거가 아닌 화면 갱신 힌트만 남으므로 서버 회수와 잠시 어긋날 수 있지만 실제 요청은 서버 쿠키와 플랫폼 검증 없이는 성공하지 않는다.

## 구현과 관련 코드

- `apps/exchange`: 기존 BTC/USDT 고객 거래 화면, 포트 3003.
- `apps/admin`: 운영자 로그인과 운영 상태·승인·시장감시·감사 요약, 포트 3004.
- `packages/ui`: 현재 두 앱이 실제 공유하는 브랜드·구역·상태 표시만 제공한다.
- `packages/bff`: 플랫폼 주소 고정, 앱별 쿠키, 출처·CSRF 확인, 인증 헤더 주입을 담당한다.
- `apps/exchange/src/lib/api.ts`: 모든 HTTP를 같은 출처 `/api/platform`으로 보내고 브라우저 토큰 저장 경로를 제거했다.

운영자 화면은 조회 결과를 원문에 가깝게 표시한다. 아직 구현하지 않은 승인용 WebAuthn 서명을 가짜 버튼으로 성공 처리하지 않는다.

## 이해에 필요한 문법과 원리

다음은 [공통 서버 중계](../../packages/bff/src/index.ts)의 일부다.

```typescript
if (access) headers.set('Authorization', `Bearer ${access}`);
let upstream: Response;
try {
  upstream = await fetch(`${platformOrigin()}/${path}${request.nextUrl.search}`, {
    method: request.method, headers, body, cache: 'no-store'
  });
} catch {
  return NextResponse.json({message: '플랫폼 응답을 확인할 수 없습니다'}, {status: 503});
}
```

서버만 읽는 쿠키에서 토큰을 꺼내 플랫폼 요청에 넣는다. TypeScript의 `try/catch`는 네트워크 실패를 플랫폼의 업무 거절과 구분한다. 응답 캐시는 사용자 간 응답 혼합을 피하려고 끈다. 실제 구현에는 10초 제한과 토큰 응답 제거도 포함된다.

다음은 [고객 세션 표시 상태](../../apps/exchange/src/lib/api.ts)의 일부다.

```typescript
static hasSession() {
  return typeof window !== 'undefined'
    && localStorage.getItem(SessionState.key) === '1';
}
```

정적 메서드를 콜백으로 넘겨도 `this` 결합이 끊기지 않도록 클래스 이름으로 키를 참조한다. 이 값은 화면 분기에만 사용하며 서버 권한을 부여하지 않는다.

## 작성한 테스트

- `tests/contracts.test.ts`의 11개 검사: 로그인 뒤 토큰 비노출, 세션 힌트, 주문 멱등 키·원문 보존, 202 결과 불명, 큰 ID 문자열, 호가 순번·시장 경계를 검증한다.
- `e2e/admin.spec.ts`의 `운영자 토큰을 브라우저에 노출하지 않고 고객 세션과 분리한다`: 로그인 응답의 토큰이 `document.cookie`와 `localStorage`에 노출되지 않는지, 운영자 쿠키가 고객 앱에 전달되지 않는지, CSRF 없는 상태 변경이 403인지 확인한다.
- `e2e/exchange.spec.ts`의 4개 검사: 자체 호가·재연결, 결과 불명 주문 재확인, 자체 체결 봉, 큰 주문 ID 취소를 검증한다.
- `tests/fake-platform.mjs`: 기존 플랫폼·데이터에 접속하지 않는 브라우저 검증용 격리 서버다.

## 실행 명령과 결과

2026-10-27 로컬에서 다음을 실행했다.

```sh
npm test
npm run lint
npm run build
npm run test:e2e
npm audit --audit-level=moderate
```

계약 11개와 Chrome 브라우저 5개가 통과했고, 두 앱의 운영 빌드와 ESLint가 통과했다. `npm audit`의 알려진 취약점은 0건이다. 점검 중 Next.js 16.1.6 계열 공지를 확인해 두 앱과 ESLint 설정을 16.4.3으로 맞췄다. 이는 실제 플랫폼 통합, 침투 시험, 브라우저 호환성, 접근성·시각 회귀 또는 운영 HTTPS 검증을 대신하지 않는다.

## 관련 커밋과 참고 자료

관련 커밋은 이 문서와 구현을 함께 담은 프론트 저장소 커밋에 연결한다. 공식 자료는 위 링크를 기준으로 2026-10-27 확인했다.
