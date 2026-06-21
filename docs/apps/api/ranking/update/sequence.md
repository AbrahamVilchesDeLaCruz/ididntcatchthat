# Update Ranking — Secuencia

Handlers que mantienen `ranking_user_scores` en write-time a través del aggregate `Ranking`.

```mermaid
sequenceDiagram
    participant Src as Gaming / Identity / Progress
    participant Bus as Event Bus
    participant H as Ranking Subscriber
    participant U as RankingUpdater
    participant Agg as Ranking
    participant R as RankingRepository
    participant Stats as RankingUserStatsQuery
    participant DB as ranking_user_scores

    Src->>Bus: DomainEvent
    Bus->>H: on(event)
    H->>U: record*()
    Note over U: Solo si show_in_ranking = true
    U->>Stats: count / avg / sum (si recalcula ventana)
    Stats-->>U: valor
    U->>R: search(RankingId)
    R->>DB: SELECT por PK compuesta
    DB-->>R: fila existente o null
    R-->>U: Ranking | null
    U->>Agg: incrementScore / applyScore / rename
    U->>R: save(ranking)
    R->>DB: UPSERT score
```

## Por evento

| Evento | Método updater | Tipos afectados |
| ------ | -------------- | --------------- |
| `GameCompleted` | `recordGameCompleted` | `most_active` |
| `AttemptRecorded` | `recordAttempt` | `most_accurate`, `top_scorer` |
| `StreakUpdated` | `recordStreakUpdated` | `best_streak` |
| `ModuleMasteryLevelIncreased` | `recordModuleMastery` | `module_master` |
| `PATCH ranking-profile` | `syncProfile` | Todas las filas del usuario (`match` + `remove` o backfill) |

## syncProfile

| Acción | Flujo |
| ------ | ----- |
| Opt-out (`show_in_ranking = false`) | `repository.match(userId)` → `repository.remove` por cada fila |
| Opt-in | `rename` en filas existentes + `backfillUser` recalcula histórico vía `RankingUserStatsQuery` |
