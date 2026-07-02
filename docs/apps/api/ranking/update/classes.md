# Update Ranking — Clases

```mermaid
classDiagram
    class RankingScoreWriter {
        +incrementScore(key, userId, nickname, delta)
        +applyScore(key, userId, nickname, score)
        +removeAllForUser(userId)
        +renameAllForUser(userId, nickname)
    }
    class RecordRankingGameCompleted {
        +execute(request)
    }
    class RecordRankingAttempt {
        +execute(request)
    }
    class SyncRankingProfile {
        +execute(request)
    }
    class RankingUpdaterOnGameCompleted {
        +on(event)
    }
    class RankingScoreRepository {
        +save(ranking)
        +search(id)
        +match(criteria)
        +remove(id)
    }
    class RankingUserStatsQuery {
        +countCompletedGames(userId, since)
        +avgAccuracy(userId, since)
        +sumCorrectCount(userId, since)
        +moduleMasteryLevels(userId)
    }
    class RankingProfileQuery {
        <<port>>
        +findEligibleUser(userId)
        +findUserRankingPreferences(userId)
    }
    RankingUpdaterOnGameCompleted --> RecordRankingGameCompleted
    RecordRankingGameCompleted --> RankingScoreWriter
    RecordRankingAttempt --> RankingScoreWriter
    SyncRankingProfile --> RankingScoreWriter
    RankingScoreWriter --> RankingScoreRepository
    RecordRankingGameCompleted --> RankingUserStatsQuery
    RecordRankingGameCompleted --> RankingProfileQuery
```

Subscribers en `projection/application/update/` delegan a use cases con `execute()`.

ACL: `IdentityRankingProfileAdapter` (search) implementa `RankingProfileQuery` vía `RankingEligibilityQuery` de Identity.
