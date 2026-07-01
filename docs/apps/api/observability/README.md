# Observability Module

Módulo técnico transversal — **no es un bounded context de dominio**. Expone métricas Prometheus de runtime y contadores de negocio `app_*`.

Separado de **Analytics** (histórico persistente en DB + page views).

## Estructura

```
observability/
├── application/summary/     ← read port + MetricsSummaryRetriever
└── infrastructure/
    ├── controllers/         ← scrape + admin JSON summary
    ├── prometheus-metrics-summary.query.ts
    └── framework/           ← @Global ObservabilityModule, MetricsInterceptor
```

Tokens compartidos en `shared/domain/`:

- `METRICS_REGISTRY` — Registry prom-client (inyectado globalmente)
- `APP_METRICS` — interfaz para contadores de negocio (`PrometheusAppMetrics` impl)

Logger (`LOGGER_SERVICE`) vive en **SharedModule**, no aquí.

## Endpoints

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| `GET` | `/metrics` | — | Prometheus text exposition (sin envelope, sin prefijo `v1`) |
| `GET` | `/v1/metrics/summary` | JWT admin | envelope `{ data: { metrics }, meta }` |

`GET /metrics` está excluido del global prefix para que Prometheus scrape en `api:3000/metrics`.

## Métricas HTTP (automáticas)

`MetricsInterceptor` global registra por request:

- `http_requests_total{method, route, status_code}`
- `http_request_duration_seconds{method, route, status_code}`

`collectDefaultMetrics()` añade métricas Node.js runtime (`nodejs_*`, `process_*`).

## Métricas de negocio `app_*`

| Métrica | Use case |
|---------|----------|
| `app_games_started_total` | `GameStarter` |
| `app_games_completed_total` | `GameCompleter` |
| `app_flashcards_created_total` | `FlashcardCreator` |
| `app_audio_generated_total{provider}` | `FlashcardAudioGenerator` (éxito) |
| `app_audio_errors_total{provider}` | `FlashcardAudioGenerator` (catch) |
| `app_auth_logins_total{provider}` | `UserAuthenticator`, `OAuthAuthenticator` |
| `app_auth_registrations_total{provider}` | `UserRegistrar`, `OAuthAuthenticator` |

## Eventos

No emite ni consume domain events.

## Cliente

- `useMetricsSummary()` — tab HTTP/Runtime/Negocio en `/backoffice/observability`
- `useAnalyticsSummary(period)` — tabs Visitas/Contenido (Analytics BC, no este módulo)

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Metrics Summary](./metrics-summary/) | `GET /v1/metrics/summary` (+ scrape `GET /metrics`) | [Clases](./metrics-summary/classes.md) · [Secuencia](./metrics-summary/sequence.md) · [Casos de uso](./metrics-summary/usecases.md) |

## Referencias

- [Observabilidad operacional](../../../../docs/observability.md)
- [ADR-020: Observability strategy](../../../../docs/adr/020-observability-strategy.md)
- [ADR-025: Backoffice metrics UX](../../../../docs/adr/025-backoffice-metrics-ux.md)
- [Analytics BC](../analytics/README.md)
