# Solana Exchange

Solana blockchain trading platform frontend built with Next.js.

## 설계와 개발 문서

- [문서 목차](docs/README.md)
- [고객 거래소·어드민 프론트 설계 기준](docs/plans/frontend-architecture.md)

고객 거래소와 어드민을 모노레포의 두 앱으로 구성할 계획이다. 현재 코드는 기존 단일 고객 앱이며 전환·배포 완료를 의미하지 않는다.

## Tech Stack

- **Framework**: Next.js 16.0.8
- **React**: 19.2.0
- **TypeScript**: ^5
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint ^9

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run start:dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

### Build for Production

```bash
npm run build
npm run start:prod
```

## Project Structure

```
solana-exchange/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout
│       ├── page.tsx        # Home page
│       └── globals.css     # Global styles
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

## API Server

현재 클라이언트에는 엔진 `http://localhost:3002`로 연결하는 경로가 있다. 고객·운영자 업무 API는 플랫폼 `http://localhost:8080`으로 정리할 계획이며, 이번 문서 작업에서는 연결 설정을 변경하지 않았다.

## License

MIT

