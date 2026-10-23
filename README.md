# CEX Frontend

BTC/USDT 거래 화면이다. 계정·주문 HTTP와 자체 호가·체결 WebSocket의 진입점은 Java 플랫폼이다. 바이낸스나 Rust 엔진을 브라우저에서 직접 호출하지 않는다.

## 실행

```sh
npm ci
npm run start:dev
```

프론트는 `http://localhost:3003`, 플랫폼은 `http://localhost:8080`을 사용한다. 다른 플랫폼 주소는 `NEXT_PUBLIC_PLATFORM_URL`로 지정한다. 배포에서 이 값을 비우면 같은 출처의 `/api`·`/ws`를 사용하므로 리버스 프록시에서 플랫폼으로 연결해야 한다.

```sh
npm test
npm run test:e2e
npm run lint
npm run build
```

브라우저 검증은 기존 서비스를 사용하는 대신 별도 Next 포트와 모의 플랫폼을 사용하며 Chrome이 필요하다. 고객·어드민 모노레포 전환은 후속 계획이다. 현재 구현은 고객 앱 하나다.

## 문서

- [문서 목차](docs/README.md)
- [BTC·플랫폼 연결과 테스트](docs/decisions/001-platform-market-and-btc.md)
- [고객·어드민 프론트 계획](docs/plans/frontend-architecture.md)

거래 화면 전환은 BTC 온체인 입출금 구현을 의미하지 않는다. 차트·호가가 비어 있으면 자체 거래 데이터가 아직 없는 상태다.

## 실제 구현과 함께 읽기 · 2026-10-23

이 문서의 관련 동작을 확인할 현재 코드다. 메서드·설정의 일부이며 독립 실행 예제가 아니다. 계획이나 과거 검토 전체가 구현·검증됐다는 뜻은 아니다.

출처: [market.ts](src/lib/market.ts#L18) · [전체 구현 설명·트레이드오프·작성한 테스트](docs/decisions/001-platform-market-and-btc.md)

```text
  if(current && current.book.engine_id===next.book.engine_id && BigInt(next.book.sequence)<=BigInt(current.book.sequence)) return current;
  return next;
}
```

`BigInt`는 문자열 순번을 JavaScript Number의 정밀도 손실 없이 비교한다. 이 블록 앞에서 거래쌍·호가·체결 필드를 검증한다. 새 화면 기능을 추가한 작업이 아니라 기존 코드를 문서에 옮긴 것이다.

이번 보강은 문서 변경이다. 신규 제품 테스트는 0개이며 제품 테스트는 재실행하지 않았다. 소스와 발췌의 일치를 별도로 검사했다. 과거 실행 결과와 현재 소스의 동작 범위는 연결한 구현 기록에서 구분한다.
