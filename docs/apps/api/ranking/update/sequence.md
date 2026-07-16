# Update Ranking — Secuencia

Handlers que mantienen `ranking_user_scores` en write-time a través del aggregate `Ranking`.

```mermaid
sequenceDiagram
    participant Src as Gaming / Identity / Progress
    participant Bus as Event Bus
    participant H as Ranking Subscriber
    participant U as RankingScoreUpdater
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

| Evento | Método updater | Tipos afectados | Periodos |
| ------ | -------------- | --------------- | -------- |
| `GameCompleted` (`mode = game`) | `RecordRankingGameCompleted` | `most_active` | `all_time` (+1 directo) + `weekly` / `monthly` (recalculados vía `countCompletedGames`) |
| `AttemptRecorded` (`mode = game`) | `RecordRankingAttempt` | `top_scorer`, `most_accurate` | `weekly` / `monthly` / `all_time` (recalculados vía `sumCorrectCount` / `avgAccuracy`) |
| `StreakUpdated` | `RecordRankingStreakUpdated` | `best_streak` | `all_time` |
| `ModuleMasteryLevelIncreased` | `RecordRankingModuleMastery` | `module_master` | `all_time` (por módulo) |
| `RankingProfileUpdated` | `SyncRankingProfile` | Todas las filas del usuario | `match(userId)` + `remove` (opt-out) o `renameAllForUser` + backfill (opt-in) |

## syncProfile

| Acción | Flujo |
| ------ | ----- |
| Opt-out (`show_in_ranking = false`) | `repository.match(userId)` → `repository.remove` por cada fila |
| Opt-in | `rename` en filas existentes + `backfillUser` recalcula histórico vía `RankingUserStatsQuery` |
