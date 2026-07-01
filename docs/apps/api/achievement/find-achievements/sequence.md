# Find Achievements — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor U as Usuario
    participant C as SearchAchievementsGetController
    participant UC as AchievementsSearcher
    participant Cat as AchievementCatalog
    participant R as UserAchievementRepository
    participant DB as PostgreSQL

    U->>C: GET /achievements?since=2026-01-01T00:00:00Z
    Note over C: JWT obligatorio

    C->>UC: execute({ userId, since? })
    UC->>Cat: definitions()
    Cat-->>UC: AchievementDefinition[]
    UC->>R: findByUser(userId)
    R->>DB: SELECT FROM user_achievements WHERE user_id = $1
    DB-->>R: unlocks[]
    R-->>UC: UserAchievement[]

    UC->>UC: merge catalog + unlocks → AchievementUserViewEntry[]
    opt since provided
        UC->>UC: filter unlockedAt > since
    end

    UC-->>C: AchievementUserViewEntry[]
    C-->>U: 200 envelope
```

## Reglas

| Regla | Detalle |
|-------|---------|
| Catálogo | 14 logros v2 — fuente `AchievementCatalog` |
| `since` | ISO8601 opcional — filtra solo desbloqueos recientes |
| Orden | `sortOrder` del catálogo |
| Sin unlock | `unlockedAt: null` |
