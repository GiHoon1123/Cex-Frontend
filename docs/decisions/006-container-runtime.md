# 고객·운영 프론트의 한 이미지와 두 실행 경계

모노레포의 고객 거래소와 운영 화면을 한 번 검증해 같은 컨테이너 이미지로 만들고, Compose에서 서로 다른 명령·포트·환경으로 실행한다.

## 문제와 기존 동작

두 Next.js 앱은 로컬에서 실행·빌드할 수 있었지만 단일 호스트 배포가 사용할 이미지가 없었다. 앱마다 별도 Dockerfile을 복사하면 Node 버전과 설치 결과가 달라질 수 있고 공통 BFF/UI 패키지 변경을 서로 다른 시점에 빌드할 위험이 있다.

## 기존 제품과 공식 자료의 접근

- [Next.js Docker 배포](https://nextjs.org/docs/app/getting-started/deploying#docker)는 Node 서버를 컨테이너로 실행하는 표준 배포를 지원한다.
- [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)는 루트 잠금 파일 하나로 워크스페이스 의존성과 스크립트를 관리한다.
- [Docker 다단계 빌드](https://docs.docker.com/build/building/multi-stage/)로 빌드 도구와 실행 단계를 구분한다.

## 선택과 트레이드오프

`node:22.22.0-bookworm-slim` 빌더가 `npm ci`와 두 앱 빌드를 한 번 수행하고, 실행 단계는 동일 산출물을 비특권 `node` 사용자로 실행한다.

- 이점: 고객/운영 앱과 공통 패키지가 같은 잠금 파일·Node 버전·커밋에서 검증된다.
- 비용: 현재 실행 이미지에 전체 워크스페이스 `node_modules`와 두 `.next` 산출물이 들어가 이미지가 더 크다.
- 대안: 앱별 독립 이미지는 크기를 줄일 수 있지만 빌드 중복과 산출물 불일치 가능성이 커진다. Next standalone 출력은 크기를 더 줄일 수 있으나 현재 요구에 필요하지 않은 설정과 복사 경로를 늘린다.

고객과 운영 앱은 같은 이미지여도 별도 컨테이너다. 세션 쿠키 이름·공개 Origin·포트와 프로세스 장애 범위를 합치지 않는다.

## 구현과 관련 코드

- [`Dockerfile`](../../Dockerfile): 잠금 설치와 전체 빌드를 실행하고 기본적으로 고객 앱을 3003에서 시작한다.
- 운영 컨테이너는 플랫폼 저장소 Compose에서 `npm run start --workspace @cex/admin`으로 명령을 바꿔 3004에서 시작한다.
- [`.dockerignore`](../../.dockerignore): 호스트의 `node_modules`, `.next`, 테스트 결과가 이미지 빌드 입력에 섞이지 않게 한다.

## 이해에 필요한 문법과 원리

실제 실행 명령이다.

```dockerfile
USER node
CMD ["npm", "run", "start", "--workspace", "@cex/exchange"]
```

`USER node`는 Next 프로세스를 root가 아닌 기반 이미지의 표준 사용자로 실행한다. JSON 배열형 `CMD`는 셸 문자열 해석 없이 인자를 그대로 전달한다. Compose의 `command`는 이미지와 파일을 바꾸지 않고 이 기본 명령만 운영 앱 명령으로 교체한다.

## 작성한 테스트

이번 변경은 화면 업무 코드를 바꾸지 않아 새 단위 테스트를 추가하지 않고 실제 이미지 회귀를 수행했다.

- 이미지 빌드 과정에서 고객·운영 Next 프로덕션 빌드를 모두 실행했다.
- 같은 이미지로 고객 컨테이너와 운영 컨테이너를 동시에 실행했다.
- 고객 `/` 200, 운영 `/` 200과 두 컨테이너의 실행 사용자 `node`를 확인했다.

기존 화면 변경에 대한 계약·브라우저 테스트는 [고객 자산 업무와 ETH 지급 심사 화면](005-custody-and-payout-ui.md)에 기록돼 있다.

## 실행 명령과 결과

```bash
docker build -t cex-frontend:deployment-review .
curl -fsS http://127.0.0.1:3303/
curl -fsS http://127.0.0.1:3304/
docker inspect -f '{{.Config.User}}' cex-exchange-deployment-review
```

이미지 빌드, 고객/운영 앱의 실제 HTTP 200, 두 컨테이너의 `node` 사용자 검사가 통과했다. 이 검사는 실제 플랫폼 인증·금융 업무 연결을 대신하지 않으며 해당 E2E는 별도 전체 회귀에서 확인한다.

## 남은 한계

이미지 다이제스트 고정, 이미지 서명, 취약점 스캔, 배포 승인과 롤백은 운영 파이프라인에서 추가해야 한다. 단일 호스트에서 두 프론트 컨테이너는 호스트 장애를 함께 겪는다.

## 관련 커밋과 참고 자료

구현과 문서는 `build(frontend): 두 앱의 컨테이너 실행 경계 고정` 커밋에 포함한다. 공식 근거는 위 Next.js, npm, Docker 문서를 사용했다.
