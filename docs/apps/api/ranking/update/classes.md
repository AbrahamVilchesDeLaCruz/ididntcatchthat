# Update Ranking — Clases

```mermaid
classDiagram
    class RankingUpdater {
        +recordGameCompleted(userId, mode, finishedAt)
        +recordAttempt(userId, mode, correct, answeredAt)
        +recordStreakUpdated(userId, newStreak)
        +recordModuleMastery(userId, module, level)
        +syncProfile(userId, showInRanking, nickname)
        +backfillUser(userId, nickname)
    }
    class Ranking {
        +incrementScore(delta)
        +applyScore(score)
        +rename(nickname)
        +toPrimitives() RankingPrimitives
    }
    class RankingRepository {
        +save(ranking)
        +search(id) Ranking
        +match(criteria) Ranking[]
        +remove(id)
    }
    class RankingUserStatsQuery {
        +countCompletedGames(userId, since)
        +avgAccuracy(userId, since)
        +sumCorrectCount(userId, since)
        +moduleMasteryLevels(userId)
    }
    class RankingUserReader {
        +findEligibleUser(userId) RankingEligibleUser
    }
    class RankingKey {
        +create(type, period, module?) RankingKey
    }
    class RankingId {
        +fromKey(key, userId) RankingId
    }
    RankingUpdater --> RankingRepository
    RankingUpdater --> RankingUserStatsQuery
    RankingUpdater --> RankingUserReader
    RankingUpdater --> Ranking
    RankingUpdater --> RankingKey
    RankingUpdater --> RankingId
    RankingRepository --> Ranking
```

El repository expone solo los cuatro métodos estándar del dominio. Las queries cross-BC para recalcular scores viven en `RankingUserStatsQuery` — puerto separado, no métodos ad-hoc en el repository.
