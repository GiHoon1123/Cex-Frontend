FROM node:22.22.0-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci
RUN npm run build

FROM node:22.22.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps ./apps
COPY --from=builder --chown=node:node /app/packages ./packages
USER node
EXPOSE 3003 3004

# 같은 검증 산출물에서 고객 앱을 기본 실행하고, 운영 앱은 Compose가 명령만 바꾼다.
CMD ["npm", "run", "start", "--workspace", "@cex/exchange"]
