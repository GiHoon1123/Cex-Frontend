# Binance 기준 차트와 자체 호가를 구분해 표시하기

거래 화면의 BTC·ETH 차트는 플랫폼이 중계한 Binance 1분 봉을 표시하고, 호가창과 최근 체결은 계속 우리 거래소 데이터만 표시한다.

## 문제와 기존 동작

자체 체결만 사용한 차트는 유동성이 적으면 비어 있었다. 실제로 한 가격의 체결 한 건만 있으면 시가·고가·저가·종가가 같아 얇은 수평선만 나타났다. 이는 계산 오류는 아니지만 포트폴리오 화면에서 전체 시장 흐름을 파악하기 어려웠다.

## 선택과 트레이드오프

Binance 봉과 자체 호가는 다른 시장이다. 같은 출처처럼 표시하면 차트 가격으로 우리 주문이 체결될 것이라는 오해가 생긴다. 차트 제목에 `Binance 외부 기준 시세`를 항상 표시하고, 호가창은 `자체 호가창`, 체결 영역은 `최근 자체 체결` 계약을 유지했다.

외부 차트는 정보량을 얻는 대신 Binance 장애에 의존한다. 실패 시 자체 체결 차트로 조용히 바꾸지 않고 오류를 겹쳐 표시한다. 사용자는 데이터 출처가 바뀌었다고 오해하지 않는다.

## 구현과 관련 코드

[MarketChart](../../apps/exchange/src/components/MarketChart.tsx)는 플랫폼 경로만 호출한다.

```ts
const load=()=>fetch(`/api/platform/api/market/${base}/USDT/reference-candles`,{
  signal:abort.signal,
  credentials:'same-origin'
});
```

15초마다 갱신하며 응답의 `source`, `market`, `interval`을 다시 확인한다. BTC/ETH 전환 시 앞선 요청을 취소하고 해당 시장 전체 봉을 적용한다. 캔버스 좌표를 위해 문자열 금액을 `Number`로 바꾸지만 주문·잔액 계산에는 사용하지 않는다.

브라우저는 Binance 도메인을 직접 호출하지 않는다. 플랫폼은 10초 캐시로 외부 호출량을 제한하고, BFF는 기존과 같이 플랫폼 한 곳만 바라본다.

## 작성한 테스트

- `e2e/exchange.spec.ts`의 `플랫폼이 중계한 Binance 기준 봉을 그리고 브라우저가 Binance를 직접 호출하지 않는다`
  - 플랫폼 응답 봉으로 캔버스를 렌더링한다.
  - 화면에 외부 출처를 표시한다.
  - 브라우저 요청에 Binance 도메인과 외부 위젯이 없는지 확인한다.
- 기존 자체 호가·최근 체결·재연결, BTC/ETH 시장 전환 테스트를 함께 실행해 차트 변경이 엔진 시장 표시를 바꾸지 않았는지 확인한다.

## 실행 명령과 결과

```text
npm test          17개 통과
npm run lint      통과
npm run build     고객·어드민 통과
npm run test:e2e  8개 통과
```

실제 Chrome에서 BTC와 ETH를 전환해 두 시장 모두 Binance 500개 1분 봉이 표시되는 것을 확인했다. 브라우저가 Binance 도메인을 직접 호출한 요청은 0건이었다. BTC 화면에서는 자체 최근 체결 60,000 USDT가 외부 기준 차트와 별도로 표시됐다. 현재 로컬 엔진에는 ETH 시장 스냅샷이 없으므로 ETH 차트는 표시되지만 호가창은 `연결 대기`로 남는 것도 함께 확인했다.

## 관련 커밋과 참고 자료

- [플랫폼 외부 기준 봉 구현](../../../Cex-Platform-Service/docs/decisions/178-binance-reference-candles.md)
- [Binance Spot Kline API](https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#klinecandlestick-data)
