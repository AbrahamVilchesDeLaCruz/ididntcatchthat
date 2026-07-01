# List Paused Games — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor U as Usuario Registrado
    participant C as SearchGamesGetController
    participant UC as PausedGamesLister
    participant GR as GameRepository
    participant DB as PostgreSQL

    U->>C: GET /games?status=paused
    Note over C: JWT obligatorio (no guest)

    C->>UC: execute({ userId, status: 'paused' })
    UC->>UC: Criteria(userId EQ, status EQ paused)
    UC->>GR: match(criteria)
    GR->>DB: SELECT * FROM games WHERE user_id = $1 AND status = 'paused'
    DB-->>GR: rows[]
    GR-->>UC: Game[]
    UC-->>C: GamePrimitives[]
    C-->>U: 200 envelope { data: [...] }
```

## Reglas

| Regla | Detalle |
|-------|---------|
| Auth | Solo usuarios registrados |
| Filtro | `status=paused` en query string |
| Límite pausados | Máx. 5 simultáneos — validado en `GamePauser`, no en listado |
| Respuesta | Array de partidas con metadata (module, cardCount, startedAt, …) |
