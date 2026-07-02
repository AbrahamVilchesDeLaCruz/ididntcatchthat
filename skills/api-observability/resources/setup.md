# Setup & Infrastructure Reference

> Este archivo es un resumen de referencia rápida para la skill.
> Documentación completa → [docs/observability.md](../../../docs/observability.md)
> Decisión arquitectónica → [ADR 020](../../../docs/adr/020-observability-strategy.md)

## Fases

| Fase | Qué | Cuándo |
|---|---|---|
| 1 | Pino (stdout JSON) + prom-client `/metrics` | Ahora — desarrollo |
| 2 | Loki + Prometheus + Grafana en Docker Compose | Antes de deploy prod |
| 2 | OTel SDK + Tempo (traces) | Junto con Fase 2 |

## Variables de entorno

```bash
# Fase 1
LOG_LEVEL=info

# Fase 2 adicionales
LOKI_URL=http://loki:3100
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces
OTEL_SERVICE_NAME=ididntcatchthat-api
GRAFANA_ADMIN_PASSWORD=<doppler>
```

## Puertos (dev — host → container)

| Servicio | Puerto host | Puerto container |
|---|---|---|
| API `/metrics` | 3001 | 3000 |
| Grafana | 3002 | 3000 |
| Prometheus | 9090 | 9090 |
| Loki | 3100 | 3100 |
