# ididntcatchthat.com

> Aprende a entender y sonar como un nativo — fonética real, connected speech y expresiones que no se enseñan en clase.

![CI](https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/actions/workflows/ci.yml/badge.svg)

---

## ¿Qué es esto?

Un juego web de aprendizaje de inglés centrado en cómo los nativos realmente hablan. Desarrollado como Trabajo de Fin de Máster (TFM).

→ [Ver descripción completa del proyecto](./docs/project-overview.md)

---

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) + Docker Compose
- [Doppler CLI](https://docs.doppler.com/docs/cli) — gestión de secrets
- [Make](https://www.gnu.org/software/make/)

---

## Levantar el proyecto

```bash
# Instalar dependencias
pnpm install

# Dev servers sin Docker (API + Client con hot-reload)
make dev

# O con Docker (todos los servicios: API, Client, Prometheus, Grafana, Loki)
make up
```

La app estará disponible en:

| Servicio    | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:4001       |
| Backend API | http://localhost:3001       |
| Swagger     | http://localhost:3001/docs  |
| Grafana     | http://localhost:3002       |
| Prometheus  | http://localhost:9090       |

---

## Estructura del monorepo

```
ididntcatchthat/
├── apps/
│   ├── client/       ← Frontend (React + Vite + TailwindCSS)
│   └── api/          ← Backend (NestJS + Clean Architecture)
├── docs/             ← Documentación del proyecto y ADRs
├── infra/            ← Configs de Prometheus, Grafana, Loki
├── skills/           ← AI agent skills (instrucciones para agentes IA)
├── prompts/          ← Prompts usados durante el desarrollo con IA
├── .github/          ← GitHub Actions workflows
├── Makefile          ← Comandos de desarrollo y despliegue
└── README.md
```

---

## Comandos disponibles

### Raíz del monorepo

| Comando           | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `pnpm install`    | Instala dependencias en todos los workspaces     |
| `pnpm lint`       | ESLint en api + client                           |
| `pnpm test`       | Unit tests en api + client                       |
| `pnpm test:e2e`   | E2E tests en api + client                        |
| `pnpm test:all`   | Unit + E2E en api + client                       |
| `pnpm test:ci`    | Tests + coverage en modo CI (GitHub Actions)     |

### Make (Docker + VPS)

| Comando              | Descripción                                          |
| -------------------- | ---------------------------------------------------- |
| `make up`            | Build + levantar todos los servicios (dev, Docker)   |
| `make down`          | Parar todos los servicios                            |
| `make dev`           | Dev servers sin Docker (API + Client con Doppler)    |
| `make dev-api`       | Solo API en modo desarrollo                          |
| `make dev-client`    | Solo Client en modo desarrollo                       |
| `make obs-up`        | Levantar stack de observabilidad (Prometheus + Grafana + Loki) |
| `make tunnel-dev`    | SSH tunnel a observabilidad de dev en VPS            |
| `make tunnel-prod`   | SSH tunnel a observabilidad de prod en VPS           |
| `make deploy-dev`    | Deploy a VPS — entorno dev                           |
| `make deploy-prod`   | Deploy a VPS — entorno prod                          |

---

## Stack

**Frontend** — React 19, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Zod  
**Backend** — NestJS, TypeScript, TypeORM, Class Validator, pino  
**Base de datos** — PostgreSQL en [Aiven](https://aiven.io/) (managed)  
**CDN** — [Cloudflare](https://www.cloudflare.com/) (archivos de audio)  
**Testing** — Vitest, Jest, Playwright  
**Observabilidad** — Prometheus, Grafana, Loki, pino-loki  
**Secrets** — [Doppler](https://doppler.com/)  
**Infra** — VPS, Docker, GitHub Actions  

---

## Documentación

- [Project Overview](./docs/project-overview.md) — qué es, por qué existe, decisiones de producto
- [ADRs](./docs/adr/) — Architecture Decision Records (22 decisiones documentadas)
- [Observability](./docs/observability.md) — setup de Prometheus, Grafana y Loki
- [Grafana Guide](./docs/grafana.md) — queries PromQL y LogQL, alertas
- [Deployment](./docs/deployment.md) — variables de entorno, secrets, deploy al VPS
- [Swagger](http://localhost:3001/docs) — contrato de API (solo en local/dev)
