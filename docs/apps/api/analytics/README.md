# Analytics BC

Bounded context de métricas de negocio persistentes y tracking de visitas web (SPA).

Separado de **Observability** (Prometheus runtime desde arranque).

## Submódulos DDD

```
analytics/
├── page-view/   ← agregado PageView (write model)
├── summary/     ← read model histórico cross-BC
└── shared/      ← AnalyticsModule + exception registry
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/analytics/pageview` | Ninguna | Registra una visita (cambio de ruta SPA) |
| GET | `/admin/analytics/summary?period=` | Admin JWT | Resumen histórico de métricas de negocio |

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

- `usePageView()` — hook global en `AppRouter` (`POST /analytics/pageview`, silencioso)
- `useAnalyticsSummary(period)` — backoffice observability tabs

## Referencias

- [ADR-026: Analytics basada en base de datos y tracking de visitas web](../../../../docs/adr/026-analytics-db-pageviews.md)
- [Observability — sección analytics](../../../../docs/observability.md)
