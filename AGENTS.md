# 프론트 작업 규칙

먼저 [공통 규칙](../AGENTS.md)을 읽는다. 아래 블록은 설치된 Next가 생성·갱신하며, 버전에 맞는 내장 문서를 확인할 때 적용한다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 실제 코드 예시를 찾는 방법

[전체 문서 적용 범위와 소스 대조 결과](../docs/reviews/2026-10-23-document-code-excerpts.md)에서 이 문서와 연결된 구현 설명·실제 코드·문법·작성한 테스트를 확인한다. 목차·작업 규칙·Git 이력에는 같은 제품 코드를 복사하지 않고 관련 구현 기록을 연결한다. 계획은 구현 결과와, 문서 검증은 제품 테스트와 구분한다.
