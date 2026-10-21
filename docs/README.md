# 프론트엔드 문서

고객 거래소와 어드민의 화면·모노레포·인증·API 설계, 구현 결정과 테스트 결과를 관리한다.

- [프론트 설계 기준과 구현 순서](plans/frontend-architecture.md): 바이낸스 다크 디자인 기준, 두 앱의 책임과 공통 코드, 인증·데이터 계약과 검증 계획.
- [전체 거래소 로드맵](../../docs/roadmap/README.md): 세 프로젝트의 업무와 개발 순서.
- [초기 인프라 설계 기준](../../docs/roadmap/infrastructure.md): EC2 한 대와 Docker Compose 배포 계획.
- [Didit KYC 연동 검토](../../docs/roadmap/didit-kyc.md): 연동 범위, 운영 조건과 검증 과제.

설계 계획과 실제 구현 결과는 구분한다. 구현 사이클마다 코드·테스트·명령·결과·커밋을 관련 문서에서 연결한다.

- [BTC·플랫폼 자체 시세 연결](decisions/001-platform-market-and-btc.md): 브라우저 직접 호출 제거, 자체 호가·체결·차트와 주문 결과 불명 처리, 계약·브라우저 검증.

- [Next 의존성 보안 갱신](decisions/002-next-security-update.md): 수정 버전·감사 결과, Strict Mode 소켓 정리와 재검증, 남은 개발 도구 보고.
