# api-observability — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-shared` | `SharedModule` — donde se registra `PinoLogger` con `LOGGER_SERVICE` |
| `api-application` | Use cases — donde se inyecta y usa el `Logger` |
| `api-events` | Subscribers — donde se loguea `info` al procesar y `error` al fallar |
| `api-error-handler` | `HttpExceptionFilter` — donde se loguea automáticamente |

## Architectural Decision

- ADR 020: [docs/adr/020-observability-strategy.md](../../../docs/adr/020-observability-strategy.md)

## External Documentation

- [Pino — Docs](https://getpino.io/#/) — logger JSON de alto rendimiento
- [NestJS-Pino](https://github.com/iamolegga/nestjs-pino) — integración NestJS alternativa
- [OpenTelemetry — Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/) — SDK de instrumentación
- [Prometheus — Data Model](https://prometheus.io/docs/concepts/data_model/) — métricas, labels, tipos (Counter, Histogram)
- [Grafana — Loki](https://grafana.com/docs/loki/latest/) — agregación de logs
- [willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus) — integración Prometheus + NestJS

## Setup

Ver `resources/setup.md` para la configuración completa de Loki, Prometheus, Grafana y OpenTelemetry.

## Structured logging format

Pino emite JSON en una línea por log. Ejemplo:

```json
{"level":"info","time":"2026-05-21T12:00:00.000Z","flashcardId":"abc123","phrase":"what is liaison","msg":"Flashcard created"}
{"level":"error","time":"2026-05-21T12:00:01.000Z","flashcardId":"abc123","provider":"elevenlabs","err":{"type":"Error","message":"timeout","stack":"..."},"msg":"Audio generation failed"}
```

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [observability.md](../../../docs/observability.md) — también en `resources/setup.md` | Setup completo: Loki, Prometheus, Grafana, OTel — configuración real del stack |
| [adr/020-observability-strategy.md](../../../docs/adr/020-observability-strategy.md) | Decisión: Pino + OTel + Prometheus como stack de observabilidad |
| [adr/010-observability.md](../../../docs/adr/010-observability.md) | Decisión inicial de observabilidad |
