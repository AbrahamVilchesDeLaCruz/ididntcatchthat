# Observabilidad — Setup Operacional

> Para uso en código (cómo loguear, métricas, etc.) → ver [skills/api-observability/SKILL.md](../skills/api-observability/SKILL.md)
> Para usar Grafana y explorar métricas → ver [grafana.md](grafana.md)
> Decisión arquitectónica → ver [ADR 020](adr/020-observability-strategy.md)

---

## Stack actual

| Componente | Puerto dev | Puerto prod | Rol |
|---|---|---|---|
| Prometheus | 9090 | 9091 | Scrape de `/metrics` de la API cada 15s |
| Grafana | 3002 | 3003 | UI de dashboards — consulta Prometheus y Loki |
| Loki | 3100 | 3101 | Storage de logs — recibe logs via pino-loki |

Acceso via SSH tunnel — ver [deployment.md](deployment.md#acceso-a-observabilidad-prometheus--grafana).

---

## Arquitectura

```
API (prom-client en memoria)
  └── GET /metrics
        └── Prometheus (scrape cada 15s) → time-series DB
                └── Grafana (PromQL) → dashboards

API (PinoLogger)
  └── pino.transport({ targets: [...] })
        ├── stdout (siempre)
        └── pino-loki → Loki → Grafana (LogQL)
```

---

## Fase 1 — Implementado ✅

### API — ObservabilityModule

- `MetricsInterceptor` global — registra `http_requests_total` y `http_request_duration_seconds` por cada request
- `MetricsGetController` — `GET /metrics` excluido del global prefix y de Swagger
- `ObservabilityModule` — Registry de prom-client, interceptor y controller

### API — SharedModule

- `Logger` interface + `LOGGER_SERVICE` Symbol en `shared/domain/logger.ts`
- `PinoLogger` — JSON en prod, pretty en dev; log de arranque en `main.ts`

### Infra

- Prometheus, Grafana y Loki en Docker Compose (base + overrides dev/prod)
- Volúmenes separados por entorno: `*_dev` / `*_prod`
- Puertos separados dev/prod — dev: `9090/3002/3100`, prod: `9091/3003/3101`
- Grafana arranca con Prometheus y Loki preconfigurados via provisioning YAML
- Prometheus configurado para scrape de `api:3000/metrics` cada 15s

---

## Fase 2 — Implementado ✅

### Loki transport (pino-loki)

`PinoLogger` usa `pino.transport` con targets múltiples:

- **stdout** — siempre activo (pino-pretty en dev, pino/file en prod)
- **pino-loki** — activo solo si `LOKI_URL` está definida en Doppler

```typescript
// apps/api/src/shared/infrastructure/logger/pino-logger.ts
const level = process.env.LOG_LEVEL ?? 'info';

pino.transport({
  targets: [
    isDev
      ? { target: 'pino-pretty', level, options: { colorize: true } }
      : { target: 'pino/file', level, options: { destination: 1 } },
    ...(lokiUrl
      ? [{
          target: 'pino-loki',
          level,
          options: {
            host: lokiUrl,
            labels: { app: 'ididntcatchthat-api', env: process.env.NODE_ENV },
          },
        }]
      : []),
  ],
})
```

Variables en Doppler (`dev` y `prd`):
```
LOKI_URL=http://loki:3100
LOG_LEVEL=info          # opcional, default: info
```

> `loki` resuelve por Docker network interna — no usar `localhost`.

---

## Securización

### Grafana

`GRAFANA_PASSWORD` gestionado por Doppler. El compose lo lee como:

```yaml
GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
```

No hay fallback — si `GRAFANA_PASSWORD` no está definido en Doppler, el contenedor falla al arrancar (comportamiento intencionado).

Sign-up deshabilitado:
```yaml
GF_USERS_ALLOW_SIGN_UP: "false"
```

### Prometheus

Prometheus no tiene autenticación propia — está protegido porque:
- Sus puertos no están expuestos públicamente en prod
- El acceso es solo via SSH tunnel

---

## Fase 2 — Backoffice UI ✅

### UI de observabilidad en el backoffice (4 tabs)

La página `/backoffice/observability` expone los datos de Prometheus y del DB en una interfaz organizada en cuatro pestañas:

| Tab | Fuente | Qué muestra |
|---|---|---|
| **HTTP** | `/admin/metrics/summary` | Total requests, tasa éxito/error (2xx/4xx/5xx separados), latencia p50/p95/p99, tabla de breakdown por ruta/método/status paginada |
| **Runtime** | `/admin/metrics/summary` | Heap usado %, event loop lag p95, pausas de GC, uptime, handles activos, CPU acumulado |
| **Negocio** | `/admin/metrics/summary` | Contadores `app_*`: partidas iniciadas/completadas, flashcards creadas, audio generado/errores, logins/registros por proveedor |
| **Usuarios** | `/admin/users/stats` | Total usuarios, nuevos 7d/30d, activos 7d/30d, canal Google vs email, engagement rate, rachas |

Todos los tabs usan el componente `InsightCard` que muestra el valor numérico junto a una frase contextual y un indicador semántico verde/ámbar/rojo basado en umbrales predefinidos.

### collectDefaultMetrics activado

`ObservabilityModule` llama a `collectDefaultMetrics({ register: registry })` al crear el Registry. Esto activa automáticamente las métricas Node.js runtime de prom-client:

- `nodejs_heap_size_used_bytes`, `nodejs_heap_size_total_bytes`
- `nodejs_gc_duration_seconds` (histogram por tipo de GC)
- `nodejs_eventloop_lag_seconds`, `_p50_seconds`, `_p95_seconds`
- `nodejs_active_handles_total`, `nodejs_active_requests_total`
- `process_cpu_seconds_total`, `process_resident_memory_bytes`
- `process_start_time_seconds`, `process_open_fds`

### Métricas de negocio `app_*`

La interfaz `AppMetrics` (en `shared/domain/`) permite que los use cases incrementen contadores sin acoplarse a prom-client. La implementación `PrometheusAppMetrics` (en `shared/infrastructure/`) registra contadores en el Registry:

| Métrica | Use case |
|---|---|
| `app_games_started_total` | `game-starter.ts` |
| `app_games_completed_total` | `game-completer.ts` |
| `app_flashcards_created_total` | CreateFlashcard use case |
| `app_audio_generated_total{provider}` | Audio generation use case |
| `app_audio_errors_total{provider}` | Audio generation use case (catch) |
| `app_auth_logins_total{provider}` | `user-authenticator.ts` + OAuth callback |
| `app_auth_registrations_total{provider}` | `user-registrar.ts` + OAuth |

### Endpoint de stats de usuarios

`GET /v1/admin/users/stats` — requiere JWT + rol `admin`. Hace queries TypeORM sobre la tabla `users` existente:

```typescript
{
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  googleUsers: number;       // oauthProvider = 'google'
  emailUsers: number;        // oauthProvider IS NULL
  usersWithStreak: number;
  avgLongestStreak: number;
  engagementRate: number;    // activeUsersLast30Days / totalUsers * 100
}
```

Ver spec completa: [docs/spec/backoffice-observability-v2.md](spec/backoffice-observability-v2.md)  
Ver ADR de decisiones: [docs/adr/025-backoffice-metrics-ux.md](adr/025-backoffice-metrics-ux.md)  
Ver diagrama de flujo: [docs/diagrams/observability-backoffice.md](diagrams/observability-backoffice.md)

---

## Fase 3 — Pendiente 🔲

### OpenTelemetry — Traces

OTel se inicializa antes de cualquier import. Requiere `--require` en el arranque:

```typescript
// apps/api/src/instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Variables a añadir en Doppler:
```
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces
OTEL_SERVICE_NAME=ididntcatchthat-api
```

### Grafana dashboards como código

Añadir dashboards en `infra/grafana/provisioning/dashboards/` como JSON.
El directorio ya está configurado en el provisioning — solo falta añadir los archivos.
