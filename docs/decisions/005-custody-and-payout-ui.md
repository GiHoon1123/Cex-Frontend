# 고객 자산 업무와 ETH 지급 심사 화면

고객이 플랫폼 하나를 통해 KYC·보안키·BTC/ETH 입출금을 시작하고, 운영자가 별도 세션에서 ETH 지급을 이중 심사하는 최소 종단 화면을 구성했다. 화면은 요청을 자체 판단하지 않고 플랫폼이 반환한 확정 상태만 표시한다.

## 문제와 기존 동작

거래 화면은 있었지만 고객이 본인확인, 입금 주소 발급, 출금 서명을 실행할 연결 화면이 없었다. 운영자 화면도 비밀번호 로그인 후의 WebAuthn 추가 인증과 ETH 지급 제안·열람·서명 흐름을 시연하지 못했다.

## 기존 제품과 표준의 접근

- WebAuthn 표준의 navigator.credentials.create/get 흐름을 사용했다. 서버가 만든 챌린지를 브라우저가 서명하고, 출금 내용과 승인 결정은 플랫폼이 다시 검증한다.
- 금융 운영의 제안자·승인자 분리 패턴에 맞춰 운영자는 출금 UUID와 승인자를 지정하고, 지정된 다른 인물이 최근 내용을 열람한 뒤 서명한다.
- 인증 토큰은 브라우저 코드에 노출하지 않고 기존 서버 중계의 HttpOnly 쿠키 경계를 유지했다.

## 선택과 트레이드오프

고객과 운영자의 자산 업무를 각각 하나의 화면에 집중시켰다. 각 상태를 별도 대시보드로 늘리면 탐색성은 좋아지지만, 완성된 백엔드 업무를 시연하는 현재 목적에 비해 화면 복잡도와 분기가 늘어난다. 반대로 최소 화면은 대량 운영 처리의 필터·페이지 탐색은 제한적이다.

출금은 화면에서 즉시 완료로 보이지 않고 RESERVED 등 플랫폼 상태를 그대로 보여 준다. 사용자에게는 추가 대기 상태가 보이지만, 운영 심사·체인 확정 전을 지급 완료로 오인하지 않는 안전성을 얻는다.

## 구현과 관련 코드

- apps/exchange/src/app/mypage/page.tsx: KYC, 고객 보안키 등록, BTC/ETH 입금 주소와 출금 서명을 연결한다.
- apps/admin/src/app/page.tsx: 운영자 비밀번호 뒤에 WebAuthn 추가 인증을 완료하고 ETH 지급 심사를 수행한다.
- packages/ui/src/webauthn.ts: 두 앱이 공유하는 base64url과 WebAuthn 바이트 계약을 한 곳에 둔다.
- apps/exchange/src/app/trades/page.tsx: 거래 기록과 취소 가능한 미체결 주문을 중복 없이 표시한다.

## 이해에 필요한 문법과 원리

다음은 packages/ui/src/webauthn.ts의 실제 부분 발췌다.

    export function decodeCreationOptions(input: PublicKeyCredentialCreationOptionsJSON) {
      return {
        ...input,
        challenge: decode(input.challenge),
        user: {...input.user, id: decode(input.user.id)},
        excludeCredentials: input.excludeCredentials?.map(item => ({...item, id: decode(item.id)})),
      };
    }

서버 JSON은 바이트를 base64url 문자열로 보내지만 WebAuthn 브라우저 API는 BufferSource를 요구한다. 챌린지만 변환하면 사용자 ID나 기존 키 ID에서 등록이 실패하므로 세 필드를 함께 변환한다. TypeScript의 선택 체이닝 때문에 제외 목록이 없으면 매핑도 실행하지 않는다.

## 작성한 테스트

- tests/contracts.test.ts
  - 출금 보안키 옵션과 응답을 표준 브라우저 계약으로 변환한다: 챌린지·키 ID의 바이트 변환과 표준 JSON 직렬화를 검증한다.
  - 보안키 등록 옵션의 사용자와 제외 키 식별자를 바이트로 변환한다: 등록 전용 필드를 누락하지 않는지 검증한다.
- e2e/admin.spec.ts 운영자 토큰을 브라우저에 노출하지 않고 고객 세션과 분리한다: 비밀번호 대기 세션에서 WebAuthn으로 승격한 후에만 운영 화면을 연다.
- e2e/exchange.spec.ts 마이페이지가 KYC와 BTC·ETH 입금 주소를 플랫폼에서만 조회한다: 자산 전환과 플랫폼 중계 경로를 브라우저에서 검증한다.

## 실행 명령과 결과

- npm test: 14개 통과, 실패·제외 0개.
- npm run lint: 고객·운영자 앱 통과, 경고 0개.
- npm run build: Next.js 16.4.3 고객·운영자 생산 빌드 통과.
- npm run test:e2e: Chromium 7개 통과, 실패·제외 0개.

실제 Didit 계정, 물리 보안키, 메인넷 입출금을 사용한 운영 검증은 아니다. E2E는 매우 작은 가짜 플랫폼으로 화면 경계와 상태 표시를 검증한다.

## 관련 커밋과 참고 자료

- 커밋: 본 문서와 구현을 하나의 프론트 자산 업무 사이클로 함께 기록한다.
- [Web Authentication API](https://developer.mozilla.org/docs/Web/API/Web_Authentication_API)
- [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)
- [플랫폼 ETH 보관·출금 결정](../../../Cex-Platform-Service/docs/decisions/175-isolated-ethereum-payout.md)
