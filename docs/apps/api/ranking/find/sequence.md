# Find Rankings — Secuencia

```mermaid
sequenceDiagram
    participant C as SearchRankingsGetController
    participant S as RankingSearcher
    participant Q as RankingLeaderboardQuery
    participant P as RankingProfileQuery
    participant V as RankingViewerProjector

    C->>S: execute({ userId, type, period, module?, limit? })
    Note over S: limit = clamp(limit ?? 10, 1, 50)
    S->>S: RankingKey.create(type, period, module)
    Note over S: effectivePeriod(type) — best_streak / module_master ⇒ 'all_time'<br/>resolveModuleScope(type, module) — module_master ⇒ module; resto ⇒ 'global'

    S->>Q: selectLeaderboard(key, limit)
    Q-->>S: entries[]

    alt user not in top N
        S->>Q: selectUserEntry(key, userId)
        Q-->>S: currentUser | null
    end

    S->>S: isMe flag por entry (entry.userId === userId)
    S->>P: findUserRankingPreferences(userId)
    P-->>S: preferences
    S->>V: project(preferences, currentUser)
    V-->>S: viewer
    S-->>C: { entries, currentUser, viewer }
```
