# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

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
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# SPA fallback — all routes → index.html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

# Allow the nginx user to write to required runtime dirs (port 8080 = no root needed)
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
