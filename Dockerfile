# Copyright (C) 2026 Icarus. All rights reserved.

FROM node:22-alpine AS builder
RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirrors.aliyun.com|g' /etc/apk/repositories
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm config set registry https://registry.npmmirror.com && pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_AMAP_JS_KEY
ARG NEXT_PUBLIC_AMAP_JS_SECRET
ARG NEXT_PUBLIC_BAIDU_MAP_AK
RUN pnpm build \
    && cp -r public .next/standalone/public \
    && cp -r .next/static .next/standalone/.next/static

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
