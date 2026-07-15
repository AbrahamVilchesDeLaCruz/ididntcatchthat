# Analytics BC

Bounded context de métricas de negocio persistentes y tracking de visitas web (SPA).

Separado de **Observability** (Prometheus runtime desde arranque).

## Submódulos DDD

```
analytics/
├── page-view/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│       ├── controllers/   ← record-page-view-post.*
│       └── persistence/     ← page-view.entity, typeorm-page-view.repository
├── summary/
│   ├── application/
│   └── infrastructure/
│       ├── controllers/   ← search-analytics-summary-get.*
│       └── persistence/     ← typeorm-analytics-summary.query
└── shared/
    └── infrastructure/framework/  ← AnalyticsModule, exception registry
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/analytics/page-views` | Ninguna | Registra una visita (cambio de ruta SPA) |
| GET | `/analytics/summary?period=` | Admin JWT | Resumen histórico de métricas de negocio |

### Períodos (`summary`)

`24h | 7d | 15d | 30d | 6m | all` — default `7d`.

## Eventos

### Eventos publicados

Ninguno — `PageViewRecorder` inserta directo en `page_views` (append-only). `AnalyticsSummaryRetriever` es read-only.

### Eventos consumidos

Ninguno — el summary agrega directamente vía SQL sobre tablas de otros BCs (`games`, `users`, `flashcards`, `page_views`), no por suscripción a eventos.

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `page_views` | Visitas web (path, visitor_id, user_id nullable, referrer) |

El read model `summary` consulta también tablas de otros BCs (`games`, `users`, `flashcards`) vía SQL raw.

## Paridad

- **Page views**: `PageView.create(...)` valida `path` no vacío (`PagePath`) y `visitorId` UUID v4 (`VisitorId`). Inserts son idempotentes a nivel de payload duplicado solo si llegan al mismo `requestId` — sin UNIQUE, por diseño (cada cambio de ruta SPA se registra).
- **Summary periods**: `24h | 7d | 15d | 30d | 6m | all` — default `7d`. Cada periodo se traduce a una ventana relativa fija (`15d = 15 days`, `6m = 6 months`). `all` devuelve todos los page views desde `min(created_at)`.
- **Cross-BC SQL**: `TypeOrmAnalyticsSummaryQuery.findSummary` ejecuta joins directos sobre `games`, `users`, `flashcards` vía SQL crudo. Es deliberado: no hay read-model de Analytics propio; los conteos se hacen en vivo. Aceptable porque el endpoint es admin-only y los volúmenes son bajos.
- **vs Observability**: este BC persiste (sobrevive reinicios); Observability es volátil (Prometheus). Ver tabla comparativa en [`search-analytics-summary/usecases.md`](./search-analytics-summary/usecases.md).

## Cliente

- `usePageView()` — hook global en `AppRouter` (`POST /analytics/page-views`, silencioso)
- `useAnalyticsSummary(period)` — backoffice observability tabs

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Record Page View](./record-page-view/) | `POST /analytics/page-views` | [Clases](./record-page-view/classes.md) · [Secuencia](./record-page-view/sequence.md) · [Casos de uso](./record-page-view/usecases.md) |
| [Search Analytics Summary](./search-analytics-summary/) | `GET /analytics/summary?period=` | [Clases](./search-analytics-summary/classes.md) · [Secuencia](./search-analytics-summary/sequence.md) · [Casos de uso](./search-analytics-summary/usecases.md) |

## Referencias

- [ADR-026: Analytics basada en base de datos y tracking de visitas web](../../../../docs/adr/026-analytics-db-pageviews.md)
- [Observability — sección analytics](../../../../docs/observability.md)
