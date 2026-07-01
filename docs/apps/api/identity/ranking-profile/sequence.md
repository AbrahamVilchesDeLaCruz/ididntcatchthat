# Ranking Profile — Diagrama de Secuencia

## GET `/users/me/ranking-profile`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant C as FindRankingProfileGetController
    participant UC as RankingProfileFinder
    participant R as UserRepository
    participant DB as users

    U->>C: GET /users/me/ranking-profile
    C->>UC: execute({ userId })
    UC->>R: search(userId)
    R->>DB: SELECT nickname, show_in_ranking
    DB-->>R: row
    R-->>UC: User
    UC-->>C: { showInRanking, nickname }
    C-->>U: 200 envelope
```

## PATCH `/users/me/ranking-profile`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant C as UpdateRankingProfilePatchController
    participant UC as RankingProfileUpdater
    participant R as UserRepository
    participant EP as DomainEventPublisher
    participant DB as users

    U->>C: PATCH /users/me/ranking-profile { showInRanking, nickname }
    C->>UC: execute({ userId, ... })
    UC->>R: search(userId)
    R->>DB: SELECT
    DB-->>R: user
    UC->>UC: user.updateRankingPreferences(...)
    UC->>R: save(user)
    R->>DB: UPDATE users
    UC->>EP: publish(RankingProfileUpdatedEvent)
    EP-->>UC: void
    UC-->>C: RankingProfileViewModel
    C-->>U: 200 envelope
```

## Downstream

`RankingProfileUpdatedEvent` → `RankingUpdaterOnRankingProfileUpdated` → `SyncRankingProfile` (Ranking BC).
