# Game Summary — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor U as Usuario / Guest
    participant C as FindGameSummaryGetController
    participant UC as GameSummaryFinder
    participant GR as GameRepository
    participant DB as PostgreSQL

    U->>C: GET /games/:id/summary
    C->>UC: execute({ gameId, userId })

    UC->>GR: search(gameId)
    DB-->>GR: game | null
    GR-->>UC: game | null

    alt game === null
        UC-->>C: throw GameNotFound
        C-->>U: 404
    else game.userId !== userId
        UC-->>C: throw GameAccessDenied
        C-->>U: 403
    else game.pendingFlashcardIds().length > 0
        UC-->>C: throw GameNotFinished
        C-->>U: 422 GameNotFinished
    else game ready
        UC->>UC: game.completionStats()
        UC-->>C: { correctCount, totalCount, accuracy, duration }
        C-->>U: 200 envelope
    end
```

## Diferencia con POST complete

| Aspecto | GET summary | POST complete |
|---------|-------------|---------------|
| Mutación | Solo lectura | Marca `status=completed` |
| Evento | No publica | Publica `GameCompleted` |
| Cuándo | Recuperar stats sin cerrar partida* | Cierre oficial de partida |

\* Si quedan flashcards pendientes → 422 en ambos casos para summary; complete también valida antes de mutar.
