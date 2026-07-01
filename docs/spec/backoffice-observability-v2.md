# Spec: Backoffice Observability v2

**Change**: `feat/backoffice-metrics-observability-ui`  
**Estado**: En implementación  
**Fecha**: 2026-06-29  
**ADRs relacionados**: ADR-010, ADR-020, ADR-025

---

## Contexto

La primera versión del backoffice de observabilidad era funcional pero limitada:

- Filtro hardcodeado que solo mostraba 2 métricas (`http_requests_total`, `http_request_duration_seconds`) descartando el resto silenciosamente.
- `collectDefaultMetrics()` nunca activado → sin métricas Node.js runtime.
- `avgMs` siempre `null` por malentendido en el formato de histogramas de prom-client.
- Error rate solo contaba 5xx (no 4xx).
- Sin datos de producto (usuarios, conversiones, canal de acceso).
- Números crudos sin contexto — sin indicadores de si un valor es bueno o malo.

Esta spec cubre la segunda iteración: 4 tabs, métricas de negocio, endpoint de usuarios desde DB, y capa de lenguaje natural (InsightCard).

---

## Scope

| Área | Incluido |
|---|---|
| `collectDefaultMetrics()` activado | ✅ |
| AppMetrics port + PrometheusAppMetrics | ✅ |
| Contadores `app_*` en use cases clave | ✅ |
| Endpoint `GET /admin/users/stats` (DB) | ✅ |
| Fix avgMs (histograma _sum/_count) | ✅ |
| Fix error rate 4xx + 5xx separados | ✅ |
| p95 desglosado por ruta | ✅ |
| 4 tabs: HTTP, Runtime, Negocio, Usuarios | ✅ |
| InsightCard con frase contextual | ✅ |
| Eliminación de MetricsTable.tsx (dead code) | ✅ |
| OTel traces | ❌ Fase 3 |
| Analytics frontend (PostHog, Plausible) | ❌ Fuera de scope |
| Grafana dashboards como código | ❌ Fase 3 |
| Alertas Prometheus | ❌ Fase 3 |
| Métricas DB (TypeORM query time) | ❌ Fase 3 |

---

## API Contracts

### Existente — `GET /v1/metrics/summary`

Autenticación: JWT Bearer + rol `admin`. Respuesta con envelope `{ data, meta }`.

```typescript
// Response body (envelope)
{
  data: {
    metrics: Array<{
      name: string;    // e.g. "http_requests_total", "nodejs_heap_size_used_bytes"
      help: string;
      type: string;    // "counter" | "histogram" | "gauge"
      samples: Array<{
        labels: Record<string, string>;  // siempre incluye "app"="ididntcatchthat-api"
        value: number;
      }>;
    }>;
  },
  meta: {
    timestamp: string;
    request_id: string;
  },
}
```

Labels HTTP: `method`, `route`, `status_code`, `app`.  
Labels histogram: añaden `le` para buckets.  
Nota: `_sum` y `_count` de histogramas se exponen como **nombres de métrica separados** (`http_request_duration_seconds_sum`, `http_request_duration_seconds_count`).

### Nuevo — `GET /v1/users/stats`

Autenticación: JWT Bearer + rol `admin`.

```typescript
// Response body
{
  totalUsers: number;            // COUNT WHERE role = 'user'
  newUsersLast7Days: number;     // COUNT WHERE created_at > NOW() - 7d AND role = 'user'
  newUsersLast30Days: number;    // COUNT WHERE created_at > NOW() - 30d AND role = 'user'
  activeUsersLast7Days: number;  // COUNT WHERE last_activity_date > NOW() - 7d AND role = 'user'
  activeUsersLast30Days: number;
  googleUsers: number;           // COUNT WHERE oauth_provider = 'google' AND role = 'user'
  emailUsers: number;            // COUNT WHERE oauth_provider IS NULL AND role = 'user'
  usersWithStreak: number;       // COUNT WHERE current_streak > 0 AND role = 'user'
  avgLongestStreak: number;      // AVG(longest_streak) WHERE role = 'user'
  engagementRate: number;        // activeUsersLast30Days / totalUsers * 100 (calculado en use case)
}
```

---

## Métricas de negocio `app_*`

| Métrica | Tipo | Labels | Use case / lugar |
|---|---|---|---|
| `app_games_started_total` | Counter | — | `game-starter.ts` |
| `app_games_completed_total` | Counter | — | `game-completer.ts` |
| `app_flashcards_created_total` | Counter | — | `CreateFlashcard` use case |
| `app_audio_generated_total` | Counter | `provider` | Audio generation use case |
| `app_audio_errors_total` | Counter | `provider` | Audio generation use case (catch) |
| `app_auth_logins_total` | Counter | `provider` (email/google) | `user-authenticator.ts` + OAuth callback |
| `app_auth_registrations_total` | Counter | `provider` (email/google) | `user-registrar.ts` + OAuth |

---

## Diseño de UI — 4 Tabs

```
┌─────────────────────────────────────────────────────────┐
│  Observabilidad                    [live · 30s] [↺] [Xs ago] │
│  Métricas del sistema en tiempo real                    │
│                                                         │
│  [ HTTP ]  [ Runtime ]  [ Negocio ]  [ Usuarios ]       │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Tab HTTP:                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 12,450   │ │ 99.8%    │ │ 0.01%    │ │ 142 ms   │  │
│  │ Requests │ │ Éxito 2xx│ │ Error 5xx│ │ p95      │  │
│  │ ●        │ │ ● verde  │ │ ● verde  │ │ ● verde  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  "El sistema responde sin errores relevantes"           │
│                                                         │
│  Requests por endpoint  [1–10 de 24 endpoints]          │
│  # │ Endpoint             │ Método │ Status │ Requests │%│
│  1 │ /api/v1/games        │ POST   │ 200    │ 4,230    │34│
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### Tab Runtime

Métricas Node.js tras activar `collectDefaultMetrics()`:

| Card | Métrica | Insight ejemplo |
|---|---|---|
| Heap usado | `nodejs_heap_size_used_bytes` / `_total_bytes` | "Memoria en niveles saludables (62%)" |
| Event loop lag | `nodejs_eventloop_lag_p95_seconds` | "Cola de eventos fluida — sin bloqueos" |
| GC pauses | `nodejs_gc_duration_seconds_sum` | "Pausas de GC normales" |
| Uptime | `process_start_time_seconds` → diff | "El servidor lleva 4 días sin reinicios" |
| Handles activos | `nodejs_active_handles_total` | "12 handles activos" |
| CPU | `process_cpu_seconds_total` | "CPU acumulado: 142s" |

### Tab Negocio

| Card | Métrica | Insight ejemplo |
|---|---|---|
| Partidas iniciadas | `app_games_started_total` | "847 partidas iniciadas desde el arranque" |
| Tasa de completado | `app_games_completed / app_games_started` | "68% de partidas llegan al final" |
| Flashcards creadas | `app_flashcards_created_total` | "1,240 flashcards gestionadas" |
| Audio generado | `app_audio_generated_total` | "320 archivos de audio generados" |
| Fallos de audio | `app_audio_errors_total` | "Sin fallos en generación de audio" |
| Logins | `app_auth_logins_total` | "234 accesos — 89% mediante Google" |
| Registros | `app_auth_registrations_total` | "45 nuevos registros — mayoría con Google" |

### Tab Usuarios

| Card | Métrica | Insight ejemplo |
|---|---|---|
| Total usuarios | `totalUsers` | "142 usuarios registrados" |
| Nuevos esta semana | `newUsersLast7Days` | "3 nuevos esta semana" |
| Activos 30d | `activeUsersLast30Days` | "67 de 142 activos el último mes (47%)" |
| Engagement | `engagementRate` | "47% de usuarios activos en los últimos 30 días" |
| Canal Google | `googleUsers / totalUsers` | "8 de cada 10 entran con Google" |
| Canal email | `emailUsers` | "27 usuarios con registro manual por email" |
| Con racha activa | `usersWithStreak` | "34 usuarios mantienen una racha hoy" |
| Racha media máx | `avgLongestStreak` | "La racha media máxima es de 7 días" |

---

## InsightCard — Contrato de props

```typescript
interface InsightCardProps {
  label: string;          // Etiqueta de la métrica (mayúsculas pequeñas)
  value: string;          // Valor principal formateado
  insight: string;        // Frase contextual en lenguaje natural
  variant: 'success' | 'warning' | 'danger' | 'neutral';
  progress?: number;      // 0–100 para barra de progreso opcional
  sub?: string;           // Detalle secundario (ej: "p50: 45ms · p99: 312ms")
}
```

---

## Requisitos funcionales

### RF-01 — collectDefaultMetrics activo

**Dado** que el servidor API ha arrancado,  
**cuando** se consulta `GET /metrics`,  
**entonces** la respuesta incluye métricas con prefijo `nodejs_` y `process_`.

### RF-02 — Endpoint de usuarios stats

**Dado** que un usuario admin está autenticado,  
**cuando** hace `GET /v1/admin/users/stats`,  
**entonces** recibe un objeto con al menos `totalUsers`, `googleUsers`, `emailUsers`, `newUsersLast7Days`, `activeUsersLast30Days` y `engagementRate`.

**Dado** que el mismo request lo hace un usuario con rol `user`,  
**cuando** el guard evalúa el rol,  
**entonces** recibe `403 Forbidden`.

### RF-03 — Tab Usuarios visible y con datos

**Dado** que el admin está en `/backoffice/observability`,  
**cuando** hace click en "Usuarios",  
**entonces** ve las cards de usuarios con valores numéricos y frases de insight.

### RF-04 — Métricas de negocio en tab Negocio

**Dado** que se ha iniciado al menos una partida desde el arranque del servidor,  
**cuando** el admin abre el tab "Negocio",  
**entonces** `app_games_started_total` muestra un valor > 0.

### RF-05 — InsightCard con indicador semántico

**Dado** que el error rate 5xx es > 1%,  
**cuando** se renderiza la card de error rate,  
**entonces** el indicador es rojo y la frase indica que hay errores a revisar.

---

## Archivos modificados / creados

### Backend

| Archivo | Cambio |
|---|---|
| `observability/infrastructure/framework/observability.module.ts` | Añadir `collectDefaultMetrics()` |
| `shared/domain/app-metrics.ts` | Nuevo: interface + Symbol |
| `shared/infrastructure/metrics/prometheus-app-metrics.ts` | Nuevo: implementación |
| `shared/infrastructure/framework/shared.module.ts` | Registrar `APP_METRICS` |
| `gaming/application/start/game-starter.ts` | Instrumentar `app_games_started_total` |
| `gaming/application/complete/game-completer.ts` | Instrumentar `app_games_completed_total` |
| `identity/user/application/login/user-authenticator.ts` | Instrumentar `app_auth_logins_total` |
| `identity/user/application/register/user-registrar.ts` | Instrumentar `app_auth_registrations_total` |
| OAuth callback controller | Instrumentar logins y registros Google |
| `identity/user/domain/user.repository.ts` | Añadir `findStats()` al interface |
| `identity/user/infrastructure/persistence/typeorm-user.repository.ts` | Implementar `findStats()` |
| `identity/user/application/stats/user-stats-retriever.ts` | Nuevo use case |
| `identity/user/infrastructure/controllers/user-stats-get.controller.ts` | Nuevo controller admin |

### Frontend

| Archivo | Cambio |
|---|---|
| `observability/utils/parseMetrics.ts` | Fix avgMs, fix error rate, añadir parseRuntimeMetrics, parseBusinessMetrics, parseLatencyByRoute |
| `observability/components/InsightCard.tsx` | Nuevo |
| `observability/components/ObservabilityTabs.tsx` | Nuevo |
| `observability/components/RuntimeMetricsSection.tsx` | Nuevo |
| `observability/components/BusinessMetricsSection.tsx` | Nuevo |
| `observability/components/UsersStatsSection.tsx` | Nuevo |
| `observability/api/observability.api.ts` | Añadir `useUserStats()` |
| `observability/api/observability.api-model.ts` | Añadir `UserStatsApiModel` |
| `observability/observability.mapper.ts` | Añadir `mapUserStats()` |
| `observability/observability.types.ts` | Añadir `UserStatsVM` |
| `observability/BackofficeObservabilityComponent.tsx` | Refactor completo con 4 tabs |
| `observability/BackofficeObservabilityContainer.tsx` | Añadir `useUserStats()` |
| `observability/components/MetricsTable.tsx` | Eliminar (dead code) |
