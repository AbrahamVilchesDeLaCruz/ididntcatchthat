# User Stats — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor A as Admin
    participant C as SearchUserStatsGetController
    participant UC as UserStatsRetriever
    participant Q as UserStatsQuery
    participant G as GamingUserActivityQuery
    participant DB as PostgreSQL

    A->>C: GET /users/stats?period=7d
    Note over C: JwtAuthGuard + RolesGuard (admin)

    alt period inválido
        C-->>A: 422 ValidationError
    end

    C->>UC: execute({ period })
    UC->>Q: findSummary(period)
    Q->>DB: aggregates users (registrations, streaks, …)
    Q->>G: countActiveUsers(since)
    G->>DB: SELECT DISTINCT user_id FROM games …
    G-->>Q: activeUsers
    DB-->>Q: metrics
    Q-->>UC: UserStatsSummary
    UC-->>C: UserStatsSummary
    C-->>A: 200 { data, meta }
```

## Períodos válidos

`24h | 7d | 15d | 30d | 6m | all` — default `7d`.
