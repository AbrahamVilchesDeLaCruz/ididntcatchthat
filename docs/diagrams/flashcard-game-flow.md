# Flashcard Game Flow

Real game lifecycle through the `games/*` endpoints. Audio served from Cloudflare CDN (no pronunciation scoring, no SM-2 — those don't exist yet).

```mermaid
sequenceDiagram
    actor User
    participant Client as React Client
    participant API as NestJS API
    participant DB as PostgreSQL
    participant CDN as Cloudflare CDN

    User->>Client: Tap "Start game"
    Client->>API: POST /games { mode, module, cardCount, source }
    API->>DB: INSERT games (status: in_progress)
    API->>DB: INSERT game_flashcards (ordered set)
    API-->>Client: 201 { gameId, flashcardIds[], cardCount }

    loop Por cada flashcard (e.g. 10)
        Client->>API: GET /games/:id/flashcards (o usa flashcardIds del start)
        API->>DB: SELECT FROM game_flashcards ORDER BY position
        API-->>Client: flashcard + audio_urls desde DB

        Client->>CDN: GET audio_urls.expression[accent].mp3
        CDN-->>Client: Stream mp3
        Client->>User: Reproduce audio + muestra expression/meaning

        User->>Client: Toca "I knew it" / "Missed it"
        Client->>API: POST /games/:id/attempts { flashcardId, correct }
        API->>DB: INSERT attempts + upsert user_flashcard_stats
        API-->>Client: 204 No Content
    end

    Client->>API: POST /games/:id/complete
    API->>DB: UPDATE games SET status='completed', finished_at=now()
    API->>DB: SELECT summary (accuracy, correct_count, total_attempts)
    API-->>Client: 200 { accuracy, correctCount, totalAttempts, ... }

    Client->>User: Muestra resumen final (streak, accuracy, accuracy)
```

## Event chain tras `POST /games/:id/complete`

El aggregate `Game` registra `GameCompletedEvent` al completar. AMQP lo entrega a **varios subscribers en paralelo**:

```mermaid
flowchart LR
    GC[GameCompletedEvent] --> MP[ModuleProgressUpdaterOnGameCompleted]
    GC --> RA[RankingUpdaterOnGameCompleted]
    GC --> UA[UnlockUserAchievementOnGameCompleted]
    GC --> SU[StreakUpdaterOnGameCompleted]

    SU -->|if streak changed| SE[StreakUpdatedEvent]
    SE --> RA2[RankingUpdaterOnStreakUpdated]
    SE --> UA2[UnlockUserAchievementOnStreakUpdated]

    MP -->|writes| T1[(module_progress)]
    RA -->|writes| T2[(ranking_user_scores)]
    RA2 -->|writes| T2
    UA -->|writes| T3[(user_achievements)]
    UA2 -->|writes| T3
    SU -->|writes| T4[(users.current_streak)]
    SU -->|writes| T5[(user_achievement_progress)]
```

| Subscriber | Subscribes to | Writes to | Notes |
|---|---|---|---|
| `ModuleProgressUpdaterOnGameCompleted` | `GameCompletedEvent` | `module_progress` | recalcula `mastery_level` |
| `RankingUpdaterOnGameCompleted` | `GameCompletedEvent` | `ranking_user_scores` | global score update |
| `UnlockUserAchievementOnGameCompleted` | `GameCompletedEvent` | `user_achievements` | via `GameCompletedAchievementUnlockPolicy` |
| `StreakUpdaterOnGameCompleted` | `GameCompletedEvent` | `users` + `user_achievement_progress` | may emit `StreakUpdatedEvent` |

## Notas

- **No SM-2, no XP, no Azure Speech.** Estos conceptos no existen en el código actual. La selección de flashcards para un game es por módulo/subcategoría/random — no por algoritmo de repetición espaciada.
- **Audio siempre desde CDN.** El campo `flashcards.audio_urls.expression.{us,uk,au}` apunta a R2/Cloudflare — la API nunca sirve binarios.
- **Accent selection es client-side.** El cliente elige `us | uk | au` del audio a reproducir; no se persiste preferencia por usuario.
- **Endpoints reales** (ver `apps/api/src/gaming/infrastructure/controllers/`):
  - `POST /games` — start (cualquier user o guest con `AnyAuthGuard`)
  - `GET /games/:id/flashcards` — lista ordenada de cartas
  - `POST /games/:id/attempts` — registra respuesta (204 No Content)
  - `POST /games/:id/complete` — completa y devuelve summary
  - `GET /games/:id/summary` — summary on-demand (también al completar)
  - `POST /games/:id/pause` + `POST /games/:id/resume` — flujo paused
  - `PATCH /games/:id` — patch parcial (e.g. last_flashcard_id)
- **Idempotencia** — `INSERT INTO attempts ... ON CONFLICT (id) DO NOTHING` (ver `typeorm-attempt.repository.ts:17-21`).
- **Resume desde pausa** — `games.last_flashcard_id` guarda la última carta vista; el cliente puede continuar desde ahí.

## Source files verified

- `apps/api/src/gaming/infrastructure/controllers/start-game-post.controller.ts`
- `apps/api/src/gaming/infrastructure/controllers/record-attempt-post.controller.ts`
- `apps/api/src/gaming/infrastructure/controllers/complete-game-post.controller.ts`
- `apps/api/src/gaming/infrastructure/controllers/find-game-summary-get.controller.ts`
- `apps/api/src/gaming/infrastructure/controllers/search-game-flashcards-get.controller.ts`
- `apps/api/src/gaming/application/start/game-starter.ts`
- `apps/api/src/gaming/application/complete/game-completer.ts`
- `apps/api/src/gaming/application/attempt/attempt-recorder.ts`
- `apps/api/src/gaming/infrastructure/persistence/typeorm-attempt.repository.ts`
- `apps/api/src/progress/application/update/update-module-progress-on-game-completed.ts`
- `apps/api/src/ranking/projection/application/update/ranking-updater-on-game-completed.ts`
- `apps/api/src/ranking/projection/application/update/ranking-updater-on-streak-updated.ts`
- `apps/api/src/achievement/user-achievement/application/unlock/unlock-user-achievement-on-game-completed.ts`
- `apps/api/src/achievement/user-achievement/application/unlock/unlock-user-achievement-on-streak-updated.ts`
- `apps/api/src/identity/user/application/update-streak/update-streak-on-game-completed.ts`
- `apps/api/src/gaming/domain/events/game-completed.event.ts`
- `apps/api/src/identity/user/domain/events/streak-updated.event.ts`