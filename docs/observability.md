# Observabilidad — Setup Operacional

> Para uso en código (cómo loguear, métricas, etc.) → ver [skills/api-observability/SKILL.md](../skills/api-observability/SKILL.md)
> Para usar Grafana y explorar métricas → ver [grafana.md](grafana.md)
> Decisión arquitectónica → ver [ADR 020](adr/020-observability-strategy.md)

---

## Stack actual (Fase 1)

| Componente | Puerto interno | Rol |
|---|---|---|
| Prometheus | 9090 | Scrape de `/metrics` de la API cada 15s |
| Grafana | 3002 | UI de dashboards — consulta Prometheus y Loki |
| Loki | 3100 | Storage de logs (levantado, sin transport aún) |

Acceso via SSH tunnel — ver [deployment.md](deployment.md#acceso-a-observabilidad-prometheus--grafana).

---

## Arquitectura

```
API (prom-client en memoria)
  └── GET /metrics
        └── Prometheus (scrape cada 15s) → time-series DB
                └── Grafana (PromQL) → dashboards

stdout (PinoLogger JSON)
  └── [Fase 2] pino-loki transport → Loki → Grafana (LogQL)
```

---

## Fase 1 — Implementado ✅

### API — ObservabilityModule

- `MetricsInterceptor` global — registra `http_requests_total` y `http_request_duration_seconds` por cada request
- `MetricsGetController` — `GET /metrics` excluido del global prefix y de Swagger
- `ObservabilityModule` — Registry de prom-client, interceptor y controller

### API — SharedModule

- `Logger` interface + `LOGGER_SERVICE` Symbol en `shared/domain/logger.ts`
- `PinoLogger` — JSON en prod, pretty en dev

### Infra

- Prometheus, Grafana y Loki en Docker Compose (base + overrides dev/prod)
- Volúmenes separados por entorno: `*_dev` / `*_prod`
- Grafana arranca con Prometheus y Loki preconfigurados via provisioning YAML
- Prometheus configurado para scrape de `api:3000/metrics` cada 15s

---

## Securización

### Grafana

`GRAFANA_PASSWORD` gestionado por Doppler. El compose lo lee como:

```yaml
GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
```

⚠️ Asegurarse de que `GRAFANA_PASSWORD` esté definido en Doppler config `dev` y `prd` con un valor fuerte — el fallback `admin` es solo para desarrollo local sin Doppler.

Sign-up deshabilitado:
```yaml
GF_USERS_ALLOW_SIGN_UP: "false"
```

### Prometheus

Prometheus no tiene autenticación propia en Fase 1 — está protegido porque:
- Sus puertos no están expuestos públicamente en prod (`docker-compose.prod.yml`)
- El acceso es solo via SSH tunnel

En Fase 2, si se añade un reverse proxy interno, configurar basic auth en nginx para `/prometheus/`.

---

## Fase 2 — Pendiente 🔲

### Loki transport (pino → Loki)

`PinoLogger` actualmente escribe solo a stdout. Para enviar logs a Loki:

```bash
pnpm --filter @ididntcatchthat/api add pino-loki
```

```typescript
// apps/api/src/shared/infrastructure/logger/pino-logger.ts
const transport = pino.transport({
  targets: [
    { target: 'pino/file', options: { destination: 1 } }, // stdout siempre
    ...(process.env.LOKI_URL
      ? [{
          target: 'pino-loki',
          options: {
            host: process.env.LOKI_URL,
            labels: { app: 'api', env: process.env.NODE_ENV },
          },
        }]
      : []),
  ],
});
```

Si `LOKI_URL` no está definida, solo stdout. En prod se añade en Doppler y los logs van a Loki sin cambios de código.

Variable a añadir en Doppler config `prd`:
```
LOKI_URL=http://loki:3100
```

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
