# Search Analytics Summary — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor A as Admin
    participant C as SearchAnalyticsSummaryGetController
    participant UC as AnalyticsSummaryRetriever
    participant Q as AnalyticsSummaryQuery
    participant DB as PostgreSQL

    A->>C: GET /analytics/summary?period=7d
    Note over C: JwtAuthGuard + RolesGuard (admin)

    alt period inválido
        C-->>A: 422
    else no admin
        C-->>A: 403
    end

    C->>UC: execute({ period })
    UC->>Q: findSummary(period)

    par Page views
        Q->>DB: SELECT FROM page_views WHERE created_at >= since
    and Games / users / flashcards
        Q->>DB: aggregates cross-BC
    end

    DB-->>Q: AnalyticsSummary
    Q-->>UC: AnalyticsSummary
    UC-->>C: ResponseAnalyticsSummaryRetriever
    C-->>A: 200 { data, meta }
```

## Períodos válidos

`24h | 7d | 15d | 30d | 6m | all` — default `7d`.
