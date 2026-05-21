# Observabilidad — Setup Operacional

> Este documento cubre la configuración de infraestructura.
> Para uso en código (cómo loguear, métricas, etc.) → ver [skills/api-observability/SKILL.md](../skills/api-observability/SKILL.md)
> Decisión arquitectónica → ver [ADR 020](adr/020-observability-strategy.md)

---

## Stack

| Componente | Puerto | Rol |
|---|---|---|
| Pino | — | Logger JSON en la app — envía a Loki |
| Prometheus | 9090 | Scrape de métricas desde `/metrics` de la API |
| Loki | 3100 | Storage de logs |
| Grafana | 3000 | Dashboards — consulta Prometheus + Loki |

---

## Fase 1 — Logs + Métricas (sin infraestructura externa)

En desarrollo los logs salen por consola en JSON. Prometheus puede levantarse localmente para ver métricas.

### Variables de entorno necesarias

```bash
LOG_LEVEL=info          # debug | info | warn | error
PORT=3000
```

### Endpoint de métricas

La API expone automáticamente `/metrics` con prom-client. Verificar:

```bash
curl http://localhost:3000/metrics
```

---

## Fase 2 — Loki + Prometheus + Grafana en VPS

### Docker Compose

```yaml
# infra/docker-compose.observability.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped

  loki:
    image: grafana/loki:2.9.0
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=false
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
      - loki
    restart: unless-stopped

volumes:
  prometheus_data:
  loki_data:
  grafana_data:
```

### Prometheus — scrape config

```yaml
# infra/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-prod'
    static_configs:
      - targets: ['api:3000']   # nombre del servicio en Docker Compose
    metrics_path: /metrics

  - job_name: 'api-dev'
    static_configs:
      - targets: ['api-dev:3001']
    metrics_path: /metrics
```

### Grafana — datasources como código

```yaml
# infra/grafana/provisioning/datasources/datasources.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
```

---

## Fase 2 — OpenTelemetry (Traces)

OTel se inicializa **antes** de cualquier import de la app. Usar `--require` en el comando de arranque:

```typescript
// src/instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://tempo:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations(), // instrumenta HTTP, TypeORM, RabbitMQ automáticamente
  ],
});

sdk.start();
```

```json
// package.json
{
  "scripts": {
    "start:prod": "node --require ./dist/instrumentation.js dist/main.js"
  }
}
```

### Variables de entorno adicionales (Fase 2)

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces
OTEL_SERVICE_NAME=ididntcatchthat-api
GRAFANA_ADMIN_PASSWORD=<secret-en-doppler>
```

---

## Pino → Loki (transporte directo)

En Fase 2, pino envía logs directamente a Loki sin agente intermedio:

```bash
pnpm add pino-loki
```

```typescript
// src/shared/infrastructure/logger/pino-logger.ts
import pino from 'pino';

const transport = pino.transport({
  targets: [
    { target: 'pino/file', options: { destination: 1 } },  // stdout siempre
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

export const pinoInstance = pino({ level: process.env.LOG_LEVEL ?? 'info' }, transport);
```

Si `LOKI_URL` no está definida (desarrollo local), solo sale por stdout. En producción se añade la variable y los logs van a Loki automáticamente — sin cambiar código.

---

## Comandos útiles

```bash
# Levantar stack de observabilidad
docker compose -f infra/docker-compose.observability.yml up -d

# Ver logs de la API en tiempo real (Fase 1 — consola)
docker logs -f api

# Verificar que Prometheus scrapeó métricas
curl http://localhost:9090/api/v1/targets

# Verificar Loki recibiendo logs
curl http://localhost:3100/ready

# Grafana UI
open http://localhost:3000
```

---

## Alertas recomendadas en Grafana

| Alerta | Condición | Severidad |
|---|---|---|
| Alta tasa de errores 5xx | `rate(http_requests_total{status=~"5.."}[5m]) > 0.05` | Critical |
| Latencia p99 > 500ms | `histogram_quantile(0.99, http_request_duration_seconds) > 0.5` | Warning |
| Cola DLQ con mensajes | Métrica custom en AmqpMessageBus | Warning |
| Disco > 80% | Node exporter | Warning |
