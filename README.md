# ididntcatchthat.com

> Aprende a entender y sonar como un nativo — fonética real, connected speech y expresiones que no se enseñan en clase.

![CI](https://github.com/tu-usuario/ididntcatchthat/actions/workflows/ci.yml/badge.svg)

---

## ¿Qué es esto?

Un juego web de aprendizaje de inglés centrado en cómo los nativos realmente hablan. Desarrollado como Trabajo de Fin de Máster (TFM).

→ [Ver descripción completa del proyecto](./docs/project-overview.md)

---

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) + Docker Compose
- [Make](https://www.gnu.org/software/make/)
- Copiar `.env.example` a `.env` y rellenar los valores

---

## Levantar el proyecto

```bash
# Instalar dependencias
make install

# Levantar todos los servicios (frontend, backend, db, observabilidad)
make dev
```

La app estará disponible en:

| Servicio    | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger     | http://localhost:3000/api |
| Grafana     | http://localhost:3001 |

---

## Estructura del monorepo

```
ididntcatchthat/
├── apps/
│   ├── client/       ← Frontend (React + Vite)
│   └── api/          ← Backend (NestJS)
├── docs/             ← Documentación del proyecto
├── infra/            ← Docker Compose, configs de observabilidad
├── skills/           ← AI agent skills
├── prompts/          ← Prompts de desarrollo con IA
├── .github/          ← GitHub Actions workflows
├── Makefile
└── README.md
```

---

## Scripts disponibles

| Comando          | Descripción                              |
| ---------------- | ---------------------------------------- |
| `make install`   | Instala dependencias en todos los paquetes |
| `make dev`       | Levanta todos los servicios en modo desarrollo |
| `make test`      | Ejecuta todos los tests (unit + integration) |
| `make test:e2e`  | Ejecuta tests E2E con Playwright         |
| `make lint`      | Linting en todo el monorepo              |
| `make format`    | Formateo con Prettier                    |
| `make build`     | Build de producción                      |

---

## Stack

**Frontend** — React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Zod  
**Backend** — NestJS, TypeScript, TypeORM, Class Validator  
**Base de datos** — PostgreSQL en [Aiven](https://aiven.io/) (managed)  
**CDN** — [Cloudflare](https://www.cloudflare.com/) (archivos de audio)  
**Testing** — Vitest, Jest, Playwright  
**Observabilidad** — OpenTelemetry, Prometheus, Grafana, Loki  
**Infra** — VPS, Docker, GitHub Actions  
**Diagramas** — Mermaid (embebido en Markdown)

---

## Documentación

- [Project Overview](./docs/project-overview.md) — qué es, por qué existe, decisiones de producto
- [ADRs](./docs/adr/) ← Architecture Decision Records (próximamente)
- [Swagger](http://localhost:3000/api) — contrato de API (en local)
