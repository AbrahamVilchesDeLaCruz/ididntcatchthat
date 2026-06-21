# Find Rankings — Clases

```mermaid
classDiagram
    class RankingFinder {
        +execute(request) RankingFinderResult
    }
    class RankingSelector {
        +selectLeaderboard(key, limit) RankingEntry[]
        +selectUserEntry(key, userId) RankingEntry
    }
    class RankingKey {
        +type RankingType
        +period RankingPeriod
        +periodBucket string
        +module string
        +create(type, period, module?) RankingKey
    }
    class RankingEntry {
        +rank number
        +userId string
        +nickname string
        +score number
        +toPrimitives() RankingEntryPrimitives
    }
    RankingFinder --> RankingSelector
    RankingFinder --> RankingKey
    RankingSelector --> RankingEntry
```

`RankingFinder` no usa el repository en el path de lectura — las queries con `RANK()` viven en `RankingSelector` (patrón selector, igual que `FlashcardSelector` en Gaming).
