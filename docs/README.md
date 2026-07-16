# ididntcatchthat — Documentación

> Índice de toda la documentación técnica del proyecto. Punto de entrada para humanos y agentes de IA.

---

## Presentación TFM · Defensa ante tribunal

Deck de defensa del Trabajo de Fin de Máster — pitch de negocio, decisiones técnicas, arquitectura y reflexión crítica. 14 slides.

| Documento | Descripción |
|---|---|
| [presentation/tfm-slides.html](./presentation/tfm-slides.html) | Deck principal · problema → oportunidad → producto → modelo de negocio → decisiones → arquitectura → calidad → reflexión → cierre |
| [presentation/tfm-video.html](./presentation/tfm-video.html) | Vídeo demostrativo del producto en uso |

---

## Empezar aquí

| Qué necesito | Documento |
|---|---|
| Entender el producto y la arquitectura general | [project-overview.md](./project-overview.md) |
| Levantar el proyecto en local | [local-development.md](./local-development.md) |
| Desplegar en el VPS | [deployment.md](./deployment.md) |
| Entender el modelo de dominio | [domain/domain-model.md](./domain/domain-model.md) |
| Ver todos los bounded contexts y sus eventos | [domain/bounded-contexts.md](./domain/bounded-contexts.md) |

---

## Ingeniería

Principios, arquitectura y convenciones que aplican a todo el sistema.

| Documento | Descripción |
|---|---|
| [engineering/engineering-principles.md](./engineering/engineering-principles.md) | SOLID, TDD, Tell Don't Ask, Object Mothers — con ejemplos del propio proyecto |
| [engineering/backend-architecture.md](./engineering/backend-architecture.md) | DDD + Onion Architecture, capas, naming, estructura de carpetas |
| [engineering/frontend-architecture.md](./engineering/frontend-architecture.md) | Pods, Container-Presentational, TanStack Query, hooks |
| [engineering/client-pods.md](./engineering/client-pods.md) | Pods en profundidad: cuándo crear qué, relación con el patrón Container |
| [engineering/testing.md](./engineering/testing.md) | Pirámide de tests, estrategia por capa, Jest + Vitest + Playwright |
| [engineering/git-workflow.md](./engineering/git-workflow.md) | Branching, naming de ramas, merge strategy, conventional commits |
| [engineering/feature-flags-and-stubs.md](./engineering/feature-flags-and-stubs.md) | Convención para stubs y "coming soon" — qué añadir, qué quitar |

---

## Dominio

El modelo conceptual del sistema — aggregates, bounded contexts, reglas de negocio.

| Documento | Descripción |
|---|---|
| [domain/domain-model.md](./domain/domain-model.md) | Aggregates, entidades, VOs y relaciones — diagrama Mermaid |
| [domain/bounded-contexts.md](./domain/bounded-contexts.md) | Mapa de BCs + flujo completo de domain events |
| [domain/bounded-contexts-detail.md](./domain/bounded-contexts-detail.md) | Detalle por BC: responsabilidades y límites |
| [domain/game-mechanics.md](./domain/game-mechanics.md) | Reglas del juego, scoring, streaks |
| [domain/content-taxonomy.md](./domain/content-taxonomy.md) | Taxonomía de contenido: categorías, subcategorías |
| [domain/progress.md](./domain/progress.md) | Modelo de progreso del usuario |
| [domain/ranking.md](./domain/ranking.md) | Sistema de ranking y tipos |
| [domain/auth-guest.md](./domain/auth-guest.md) | Flujo de auth: JWT, OAuth Google, guest tokens |
| [domain/db-schema.md](./domain/db-schema.md) | Esquema de base de datos |
| [domain/rabbitmq-design.md](./domain/rabbitmq-design.md) | Diseño de exchanges y queues RabbitMQ |
| [domain/notifications.md](./domain/notifications.md) | Flujos de notificación (email, push) |
| [domain/user-profile-pronunciation.md](./domain/user-profile-pronunciation.md) | Perfil de usuario y evaluación de pronunciación |
| [domain/content-backoffice.md](./domain/content-backoffice.md) | Gestión de contenido desde el backoffice |
| [domain/monetization-future.md](./domain/monetization-future.md) | El rol `premium` está reservado — qué hay y qué no |

---

## Especificaciones por feature

Contratos de implementación. Cada spec define qué construir, el modelo de dominio y los criterios de aceptación.

| Spec | Estado | Scope |
|---|---|---|
| [spec/gaming.md](./spec/gaming.md) | Implementado | API — BC Gaming |
| [spec/gaming-client.md](./spec/gaming-client.md) | En progreso | Cliente — pod game |
| [spec/game-stats-ux.md](./spec/game-stats-ux.md) | Implementado | API + Cliente |
| [spec/study.md](./spec/study.md) | Implementado | API — BC Gaming (study mode) |
| [spec/study-client.md](./spec/study-client.md) | Implementado | Cliente — pod study |
| [spec/progress.md](./spec/progress.md) | Implementado | API — BC Progress |
| [spec/progress-ux-v2.md](./spec/progress-ux-v2.md) | Implementado | API + Cliente |
| [spec/ranking.md](./spec/ranking.md) | Implementado | API — BC Ranking |
| [spec/ranking-client.md](./spec/ranking-client.md) | En progreso | Cliente — pod ranking |
| [spec/auth.md](./spec/auth.md) | Aprobado | API — BC Identity |
| [spec/content.md](./spec/content.md) | En progreso | API — BC Content |
| [spec/achievements.md](./spec/achievements.md) | En progreso | API — BC Achievement |
| [spec/home-client.md](./spec/home-client.md) | En progreso | Cliente — pod home |
| [spec/profile-client.md](./spec/profile-client.md) | En progreso | Cliente — pod profile |
| [spec/observability-stack.md](./spec/observability-stack.md) | Implementado | Infra |
| [spec/backoffice-observability-v2.md](./spec/backoffice-observability-v2.md) | En implementación | API + Cliente |

---

## Tareas de implementación

Checklists TDD por feature. Fuente de verdad del progreso real de cada BC.

| Tasks | Completadas | Total |
|---|---|---|
| [tasks/gaming.md](./tasks/gaming.md) | 30 | 30 |
| [tasks/study.md](./tasks/study.md) | 20 | 20 |
| [tasks/progress.md](./tasks/progress.md) | 27 | 27 |
| [tasks/progress-ux-v2.md](./tasks/progress-ux-v2.md) | 7 | 7 |
| [tasks/ranking.md](./tasks/ranking.md) | 16 | 16 |
| [tasks/ranking-ux.md](./tasks/ranking-ux.md) | 9 | 9 |
| [tasks/auth.md](./tasks/auth.md) | 34 | 36 |
| [tasks/content.md](./tasks/content.md) | 10 | 36 |
| [tasks/gaming-client.md](./tasks/gaming-client.md) | 3 | 17 |
| [tasks/home-sidebar-profile.md](./tasks/home-sidebar-profile.md) | En curso | — |
| [tasks/landing-design-polish.md](./tasks/landing-design-polish.md) | En curso | — |

---

## ADRs — Architecture Decision Records

Decisiones de arquitectura con contexto histórico. Cada ADR explica el **por qué**.

| ADR | Decisión |
|---|---|
| [001](./adr/001-monorepo.md) | Monorepo con apps/api y apps/client |
| [002](./adr/002-nestjs-typeorm.md) | NestJS + TypeORM para el backend |
| [003](./adr/003-react-vite.md) | React + Vite para el frontend |
| [004](./adr/004-postgresql-aiven.md) | PostgreSQL en Aiven (managed DB) |
| [005](./adr/005-cloudflare-cdn.md) | Cloudflare CDN para audio |
| [006](./adr/006-vps.md) | VPS propia para hosting |
| [007](./adr/007-license.md) | Licencia del proyecto |
| [008](./adr/008-azure-speech.md) | Azure Speech Service para pronunciación |
| [009](./adr/009-elevenlabs.md) | ElevenLabs para generación de audio |
| [010](./adr/010-observability.md) | Stack de observabilidad (OTel + Prometheus + Grafana) |
| [011](./adr/011-curated-content.md) | Contenido curado vs generado dinámicamente |
| [012](./adr/012-audio-pipeline.md) | Pipeline offline de generación de audio |
| [013](./adr/013-git-workflow.md) | Git workflow: branching y merge strategy |
| [014](./adr/014-ci-path-filters.md) | CI con path filters por app |
| [015](./adr/015-docker-strategy.md) | Estrategia Docker (multi-stage, compose) |
| [016](./adr/016-environments-strategy.md) | Estrategia de entornos (local / dev / prod) |
| [017](./adr/017-secrets-doppler.md) | Gestión de secrets con Doppler |
| [018](./adr/018-auth-strategy.md) | Estrategia de autenticación (JWT + OAuth + guest) |
| [019](./adr/019-event-bus-strategy.md) | Event bus: RabbitMQ + in-process |
| [020](./adr/020-observability-strategy.md) | Estrategia de observabilidad cloud-native |
| [021](./adr/021-resend-email.md) | Resend para email transaccional |
| [022](./adr/022-swagger-openapi.md) | OpenAPI / Swagger para contrato de API |
| [023](./adr/023-gaming-attempt-aggregate-boundary.md) | Límite del aggregate Game + Attempt |
| [024](./adr/024-content-taxonomy.md) | Taxonomía de contenido: categorías y subcategorías |
| [025](./adr/025-backoffice-metrics-ux.md) | UX del backoffice de métricas |
| [026](./adr/026-analytics-db-pageviews.md) | Pageviews en DB propia (sin Analytics externo) |
| [027](./adr/027-study-mode-architecture.md) | Arquitectura del modo estudio |
| [028](./adr/028-achievements-system.md) | Sistema de logros (achievements) |
| [029](./adr/029-trivy-vulnerability-scanning.md) | Trivy como escáner de vulnerabilidades en CI |
| [030](./adr/030-docker-port-binding-policy.md) | Política de binding de puertos Docker en VPS |
| [031](./adr/031-deepseek.md) | DeepSeek como proveedor de IA generativa en backoffice |
| [032](./adr/032-minio-local-s3.md) | MinIO como S3-compatible local (sustituto de Cloudflare R2) |
| [033](./adr/033-threat-model.md) | Modelo de amenaza y postura de seguridad (STRIDE) |

---

## Diagramas del sistema

| Diagrama | Descripción |
|---|---|
| [diagrams/system-architecture.md](./diagrams/system-architecture.md) | Arquitectura de alto nivel |
| [diagrams/data-model.md](./diagrams/data-model.md) | Modelo de datos relacional |
| [diagrams/audio-pipeline.md](./diagrams/audio-pipeline.md) | Pipeline de generación de audio |
| [diagrams/flashcard-game-flow.md](./diagrams/flashcard-game-flow.md) | Flujo completo de una partida |
| [diagrams/observability-backoffice.md](./diagrams/observability-backoffice.md) | Stack de observabilidad y backoffice |

---

## Diagramas por use case (`apps/api/`)

Trazabilidad completa de cada bounded context: secuencia, clases y casos de uso por feature.

| BC | README |
|---|---|
| Achievement | [apps/api/achievement/](./apps/api/achievement/README.md) |
| Analytics | [apps/api/analytics/](./apps/api/analytics/README.md) |
| Content | [apps/api/content/](./apps/api/content/README.md) |
| Gaming | [apps/api/gaming/](./apps/api/gaming/README.md) |
| Identity | [apps/api/identity/](./apps/api/identity/README.md) |
| Observability | [apps/api/observability/](./apps/api/observability/README.md) |
| Progress | [apps/api/progress/](./apps/api/progress/README.md) |
| Ranking | [apps/api/ranking/](./apps/api/ranking/README.md) |

---

## Operaciones

| Documento | Descripción |
|---|---|
| [local-development.md](./local-development.md) | Quick start, credenciales demo, puertos, troubleshooting |
| [deployment.md](./deployment.md) | VPS, nginx, HTTPS, Doppler, CI/CD |
| [observability.md](./observability.md) | Setup de observabilidad: OTel, Prometheus, Grafana, Loki |
| [grafana.md](./grafana.md) | Dashboards de Grafana: métricas técnicas y de negocio |
| [vps-security.md](./vps-security.md) | Hardening del VPS, incident response, `make security-*` |
| [infra/docker-image-audit.md](./infra/docker-image-audit.md) | Inventario de imágenes Docker y Trivy |
| [seo.md](./seo.md) | SEO y metadatos del cliente |
| [runbook/first-deploy.md](./runbook/first-deploy.md) | Runbook paso a paso para el primer deploy a un VPS nuevo |
| [runbook/capacity-plan.md](./runbook/capacity-plan.md) | Estimaciones de tráfico, cuellos de botella y plan de escalado |

---

## Convenciones

| Documento | Descripción |
|---|---|
| [conventions/eslint-prettier.md](./conventions/eslint-prettier.md) | ESLint + Prettier: configuración y reglas |
| [conventions/jest-esm.md](./conventions/jest-esm.md) | Setup de Jest con ESM: problemas conocidos y soluciones |
| [conventions/scaffold-nestjs.md](./conventions/scaffold-nestjs.md) | Scaffold inicial de la API NestJS |
| [conventions/scaffold-vite-react.md](./conventions/scaffold-vite-react.md) | Scaffold inicial del cliente React + Vite |
| [conventions/validate-docker-setup.md](./conventions/validate-docker-setup.md) | Validación del setup de Docker Compose |

---

## Brand

| Documento | Descripción |
|---|---|
| [brand/ididntcatchthat-brandsheet.html](./brand/ididntcatchthat-brandsheet.html) | Brand sheet: colores, tipografía, identidad visual |

---

## Retrospectiva

| Documento | Descripción |
|---|---|
| [retrospective.md](./retrospective.md) | Lecciones aprendidas del TFM: bugs reales, decisiones sorprendentes, qué haríamos diferente |
