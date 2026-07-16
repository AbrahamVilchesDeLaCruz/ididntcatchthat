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

### Eventos publicados

Ninguno — el módulo expone métricas de proceso (Prometheus + interceptors), no domain events.

### Eventos consumidos

Ninguno.

## Tablas

Ninguna — todas las métricas viven en memoria en el `Registry` de `prom-client`. Los snapshots que produce `MetricsSummaryQuery` se generan leyendo el registry en tiempo de consulta. Reinicio del proceso reinicia todos los contadores.

## Cliente

- `useMetricsSummary()` — tab HTTP/Runtime/Negocio en `/backoffice/observability`
- `useAnalyticsSummary(period)` — tabs Visitas/Contenido (Analytics BC, no este módulo)

## Paridad

- **Cardinalidad acotada**: las métricas de negocio `app_*` están definidas como `Counter` con labels discretos (`{provider}` para audio/auth, sin labels libres). El interceptor HTTP etiqueta por `(method, route, status_code)` — `route` se normaliza con el path param (`:id`) para no explotar cardinalidad.
- **Origen de los `app_*`**: cada incremento vive en el use case que materializa el evento (ver tabla arriba). No hay emitters fuera de `application/`.
- **vs Analytics**: este módulo expone métricas volátiles (Prometheus); el read model histórico vive en el BC Analytics (PostgreSQL). Ambos exponen endpoints separados (`/v1/metrics/summary` vs `/v1/analytics/summary`).

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Metrics Summary](./metrics-summary/) | `GET /v1/metrics/summary` (+ scrape `GET /metrics`) | [Clases](./metrics-summary/classes.md) · [Secuencia](./metrics-summary/sequence.md) · [Casos de uso](./metrics-summary/usecases.md) |

## Referencias

- [Observabilidad operacional](../../../../docs/observability.md)
- [ADR-020: Observability strategy](../../../../docs/adr/020-observability-strategy.md)
- [ADR-025: Backoffice metrics UX](../../../../docs/adr/025-backoffice-metrics-ux.md)
- [Analytics BC](../analytics/README.md)
