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
