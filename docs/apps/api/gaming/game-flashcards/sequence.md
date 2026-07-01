# Game Flashcards — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor U as Usuario / Guest
    participant C as SearchGameFlashcardsGetController
    participant UC as GameFlashcardsFetcher
    participant GR as GameRepository
    participant Q as GameFlashcardQuery
    participant DB as PostgreSQL

    U->>C: GET /games/:id/flashcards
    C->>UC: execute({ gameId, userId })

    UC->>GR: search(gameId)
    GR->>DB: SELECT game
    DB-->>GR: game | null

    alt game === null
        UC-->>C: GameNotFound → 404
    else access denied
        UC-->>C: GameAccessDenied → 403
    end

    UC->>Q: findByGameId(gameId)
    Q->>DB: JOIN game_flashcards + flashcards (+ attempts/views)
    DB-->>Q: rows[]
    Q-->>UC: GameFlashcardDto[]
    UC-->>C: GameFlashcardDto[]
    C-->>U: 200 envelope
```

## Reglas

| Regla | Detalle |
|-------|---------|
| Auth | JWT o guest |
| Ownership | Misma regla que otros endpoints de game |
| Orden | Respeta `order` en `game_flashcards` |
| `attempted` | true si hay attempt (game) o view (study) registrado |
