# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json* .npmrc* ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source
COPY apps/api/ ./apps/api/
COPY tsconfig.json ./

RUN pnpm --filter @ididntcatchthat/api build

# ─── Stage 2: runtime ────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json* .npmrc* ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "docker-entrypoint.sh"]
