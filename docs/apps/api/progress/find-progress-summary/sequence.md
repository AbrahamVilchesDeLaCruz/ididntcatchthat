# Find Progress Summary — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor U as Usuario
    participant C as FindProgressSummaryGetController
    participant UC as ProgressSummaryFinder
    participant Q as ProgressSummaryQuery
    participant DB as PostgreSQL

    U->>C: GET /progress/summary
    C->>UC: execute({ userId })
    UC->>Q: findByUserId(userId)

    par Streak (Identity ACL)
        Q->>DB: SELECT current/longest streak FROM users
    and Games completed (Gaming ACL)
        Q->>DB: SELECT COUNT(*) FROM games WHERE status=completed
    and Flashcard stats
        Q->>DB: aggregates on user_flashcard_stats (accuracy7d, weak, mastered)
    end

    DB-->>Q: rows
    Q-->>UC: ProgressSummary
    UC-->>C: ProgressSummary
    C-->>U: 200 { data: ProgressSummary, meta }
```

## Reglas

| Regla | Detalle |
|-------|---------|
| Auth | JWT obligatorio |
| `accuracy7d` | Intentos correctos / totales en ventana 7 días |
| `weakCount` | Flashcards con accuracy < 0.5 y al menos 1 intento |
| `masteredCount` | Flashcards con mastery ≥ 2 |
| Cross-BC | Streak vía `USER_STREAK_QUERY`; games vía `USER_GAMES_COMPLETED_QUERY` |
