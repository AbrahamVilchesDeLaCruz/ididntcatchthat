# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json* ./
COPY apps/client/package.json ./apps/client/

RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/client/ ./apps/client/
COPY tsconfig.json ./

# Never bake an absolute API URL — nginx proxies /api/v1 to the api service.
# Doppler may inject VITE_API_URL during `make up`; clear it for this step.
RUN VITE_API_URL= VITE_API_PROXY_TARGET= pnpm --filter @ididntcatchthat/client build

# ─── Stage 2: runtime (nginx) ────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# SPA fallback — all routes → index.html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
