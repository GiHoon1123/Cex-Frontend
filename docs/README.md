# 프론트엔드 문서

고객 거래소와 어드민의 화면·모노레포·인증·API 설계, 구현 결정과 테스트 결과를 관리한다.

- [프론트 설계 기준과 구현 순서](plans/frontend-architecture.md): 바이낸스 다크 디자인 기준, 두 앱의 책임과 공통 코드, 인증·데이터 계약과 검증 계획.
- [전체 거래소 로드맵](../../docs/roadmap/README.md): 세 프로젝트의 업무와 개발 순서.
- [초기 인프라 설계 기준](../../docs/roadmap/infrastructure.md): EC2 한 대와 Docker Compose 배포 계획.
- [Didit KYC 연동 검토](../../docs/roadmap/didit-kyc.md): 연동 범위, 운영 조건과 검증 과제.

설계 계획과 실제 구현 결과는 구분한다. 구현 사이클마다 코드·테스트·명령·결과·커밋을 관련 문서에서 연결한다.

- [BTC·플랫폼 자체 시세 연결](decisions/001-platform-market-and-btc.md): 브라우저 직접 호출 제거, 자체 호가·체결·차트와 주문 결과 불명 처리, 계약·브라우저 검증.

- [Next 의존성 보안 갱신](decisions/002-next-security-update.md): 수정 버전·감사 결과, Strict Mode 소켓 정리와 재검증, 남은 개발 도구 보고.
- [모노레포·서버 세션 중계·운영 화면](decisions/003-monorepo-session-and-admin.md): 두 앱의 실행 경계, 브라우저 토큰 제거, CSRF·세션 분리와 작성한 테스트.
- [ETH/USDT 거래 화면](decisions/004-ethereum-market.md): 시장별 소켓·차트·주문 원본과 브라우저 검증.
- [고객 자산 업무와 ETH 지급 심사 화면](decisions/005-custody-and-payout-ui.md): KYC·보안키·BTC/ETH 입출금, 운영자 추가 인증과 ETH 지급 승인 계약.
- [고객·운영 프론트의 한 이미지와 두 실행 경계](decisions/006-container-runtime.md): 고정 Node·잠금 설치·비특권 사용자와 두 컨테이너의 실제 HTTP 검증.
- [실제 브라우저 사용자 흐름 복구](decisions/007-browser-flow-recovery.md): 회원가입 정책, 자체 BTC 체결·차트, 운영자 최초 보안키, 바이낸스 다크 레이아웃의 실제 Chrome 검증.
- [Binance 기준 차트와 자체 호가 분리](decisions/008-binance-reference-chart.md): 플랫폼이 중계한 BTC·ETH 외부 기준 봉, 출처·갱신·장애 표시와 브라우저 직접 호출 차단.
- [반응형 차트 기간 선택](decisions/009-responsive-chart-periods.md): 분·시간·일·주·월봉 선택, 좁은 화면의 헤더·시장 선택·주문 패널 보정과 다섯 화면 폭 회귀.

## 2026-10-23 실제 코드 발췌 보강

기존 결정 문서 2개의 문법/원리 설명에 현재 소스의 실제 발췌·출처 위치·처리 순서 설명을 추가했다. 코드 내용은 유지하고 공통 들여쓰기/행 끝 공백만 정리했다. 과거 구현·검증 수치를 현재 소스와 혼동하지 않도록 기준일과 부분 발췌임을 표시했다. [소스 대조 기록](reference/code-examples-verification-2026-10-23.json)을 함께 읽는다. 이 보강은 문서만 변경했으며 제품 테스트를 새로 실행한 결과가 아니다.

## 실제 코드 예시를 찾는 방법

[전체 문서 적용 범위와 소스 대조 결과](../../docs/reviews/2026-10-23-document-code-excerpts.md)에서 이 문서와 연결된 구현 설명·실제 코드·문법·작성한 테스트를 확인한다. 목차·작업 규칙·Git 이력에는 같은 제품 코드를 복사하지 않고 관련 구현 기록을 연결한다. 계획은 구현 결과와, 문서 검증은 제품 테스트와 구분한다.
