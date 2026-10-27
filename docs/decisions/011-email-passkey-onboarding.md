# 이메일 확인부터 출금 보안키 등록까지 연결하기

플랫폼에 이미 있던 이메일 확인과 고객 WebAuthn API를 고객 화면에 연결했다. 신규 고객이 메일 링크를 명시적으로 확인한 뒤에만 출금 보안키를 등록할 수 있고, Didit 미설정을 KYC 성공처럼 보이지 않게 한 브라우저 흐름을 설명한다.

## 문제와 기존 동작

마이페이지에는 출금 보안키 등록 버튼이 있었지만 선행 조건인 이메일 확인 화면이 없었다. 신규 계정은 플랫폼의 올바른 `403` 정책에 막혔고 사용자는 해결 방법을 알 수 없었다. KYC 조회의 `503`도 모두 `확인 필요`로 뭉개져 외부 자격 증명 미설정과 고객의 미완료 상태를 구분하지 못했다.

보안키 등록 성공 시 플랫폼은 기존 세션을 회수한다. 화면이 즉시 인증 상태를 잃고 사라져 성공 안내조차 볼 수 없는 문제도 있었다.

## 기존 제품과 공식 자료의 접근

- [OWASP 이메일 확인 지침](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html)의 일회용·기한 제한 토큰 패턴을 기존 플랫폼 API 그대로 사용했다.
- 메일 보안 스캐너가 링크를 미리 조회할 수 있으므로 GET으로 토큰을 소비하지 않는다. 확인 화면을 먼저 열고 고객의 명시적인 POST 버튼으로 확정한다.
- [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)의 등록 절차에 따라 플랫폼 옵션을 `navigator.credentials.create()`에 전달하고 생성 결과만 서버로 반환한다.

## 선택과 트레이드오프

회원가입 직후 이메일 확인을 강제하는 별도 마법사 대신 현재 마이페이지에 선행 조건을 보였다. 화면 이동이 적고 기존 플랫폼 업무를 그대로 드러내지만, 자산 화면에 세 개의 보안 상태가 함께 표시된다. 현재 요구사항을 충족하는 가장 작은 엔드투엔드 흐름을 우선했다.

KYC `503`에서는 버튼을 비활성화하고 정확한 설정 부재를 표시한다. 새로고침 전 자동 재시도는 하지 않아 외부 장애 중 반복 요청을 막는 대신, 자격 증명을 추가한 뒤 사용자가 화면을 다시 열어야 한다.

보안키 등록 뒤 성공 문구를 유지하면서 세션 힌트는 즉시 제거한다. 회수된 세션을 몰래 연장하지 않고 재로그인을 요구하므로 보안 경계는 유지되지만 사용자는 한 번 더 로그인해야 한다.

## 구현과 관련 코드

[이메일 확인 화면](../../apps/exchange/src/app/account/verify-email/page.tsx)의 실제 일부다.

```tsx
async function confirm(){
  try{
    setBusy(true);
    const status=await apiClient.confirmEmailVerification(challenge,token);
    setDone(status.verified);
    setMessage(status.verified?'이메일 주소를 확인했습니다. 이제 출금 보안키를 등록할 수 있습니다.':'이메일 주소를 확인하지 못했습니다.');
  }catch(problem){
    setMessage(problem instanceof Error?problem.message:'이메일 주소를 확인하지 못했습니다.');
  }finally{
    setBusy(false);
  }
}
```

이 발췌는 가독성을 위해 줄만 나눈 현재 코드다. `useSearchParams()`로 챌린지와 토큰을 읽지만 컴포넌트가 렌더될 때 서버 요청을 보내지 않는다. 버튼 클릭에서만 POST가 실행된다. `try/catch/finally`는 TypeScript의 비동기 성공·실패·정리 경계이며, 실패해도 버튼 대기 상태를 반드시 해제한다.

[마이페이지](../../apps/exchange/src/app/mypage/page.tsx)는 `/api/customer/email`의 `recentlyVerified`가 참일 때만 현재 비밀번호와 등록 버튼을 활성화한다. 단순 `verified`가 아니라 현재 로그인 세션에 결합된 최근 확인을 요구한다. 등록 성공 뒤 `SessionState.set(false)`로 회수 사실을 반영하되 `registered` 상태로 성공 안내를 남긴다.

[API 클라이언트](../../apps/exchange/src/lib/api.ts)는 이메일 상태 조회, 챌린지 발급, 명시적 확인의 세 계약만 추가했다. 별도 호환 계층이나 프론트 전용 가짜 상태는 만들지 않았다.

## 작성한 테스트

[브라우저 테스트](../../e2e/exchange.spec.ts)의 `이메일을 명시적으로 확인한 고객만 출금 보안키를 등록한다`가 다음을 검증한다.

- 이메일 확인 전 비밀번호 입력과 보안키 등록 버튼은 비활성화된다.
- Didit `503`은 `Didit 설정 필요`로 구분된다.
- 확인 메일 요청 뒤 링크 화면을 여는 것만으로 확정되지 않고 버튼을 눌러야 POST가 실행된다.
- 확인 후 마이페이지로 돌아오면 보안키를 만들고 등록 성공 안내가 유지된다.

기존 `마이페이지가 KYC와 BTC·ETH 입금 주소를 플랫폼에서만 조회한다`에는 확인된 이메일 응답을 추가해 기존 자산 흐름도 함께 회귀했다.

실제 전체 스택 검증에서는 새 고객을 만들고 Mailpit의 실제 메일 링크를 Chrome으로 열었다. Chrome 가상 WebAuthn 인증기의 공개키 등록을 플랫폼까지 전송했고, 메일 수신 2건과 PostgreSQL 이메일 확인·MFA 등록 이력을 확인했다.

## 실행 명령과 결과

```text
npm run lint
고객·운영 앱 성공

npm test
17 통과, 실패 0, 제외 0

npm run test:e2e
10 통과, 실패 0, 제외 0

NEXT_DIST_DIR=.next-market-build npm run build --workspace @cex/exchange
성공, /account/verify-email 정적 경로 포함
```

브라우저 시험 중 개발 서버가 새 경로를 처음 컴파일하며 Fast Refresh 전체 재로딩 경고 1회가 있었지만 10개 시나리오는 모두 통과했다. 프로덕션 빌드도 별도로 성공했다.

## 남은 한계

Didit 샌드박스 자격 증명이 없어 실제 KYC 세션 생성과 공급자 화면 완료는 검증하지 못했다. 화면은 이 상태를 명시적으로 차단한다. 자동 브라우저 회귀는 가상 인증기를 사용하므로 실물 보안키·생체 장치·운영 HTTPS 검증을 대신하지 않는다. Mailpit은 로컬 수신함이며 실제 외부 메일 전달 성공을 증명하지 않는다.

## 관련 커밋과 참고 자료

플랫폼의 루프백 SMTP 경계와 실제 로컬 실행은 `Cex-Platform-Service/docs/decisions/179-loopback-customer-mail.md`를 함께 본다.

