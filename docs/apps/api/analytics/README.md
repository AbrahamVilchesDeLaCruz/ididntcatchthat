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

No emite ni consume domain events. Append-only en `page_views`.

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `page_views` | Visitas web (path, visitor_id, user_id nullable, referrer) |

El read model `summary` consulta también tablas de otros BCs (`games`, `users`, `flashcards`) vía SQL raw.

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
