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
