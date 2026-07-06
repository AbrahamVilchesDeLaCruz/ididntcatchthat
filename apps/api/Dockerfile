# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

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

RUN apk upgrade --no-cache \
    && corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json* .npmrc* ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Remove npm from the runtime image — not needed and reduces attack surface
RUN npm uninstall -g npm

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

RUN chown -R node:node /app

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000

USER node

EXPOSE 3000

CMD ["sh", "docker-entrypoint.sh"]
