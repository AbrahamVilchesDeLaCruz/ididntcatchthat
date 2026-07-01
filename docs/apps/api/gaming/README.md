# Gaming BC

## Estructura

```
gaming/
├── domain/           ← Game (aggregate), Attempt, View, policies, events
├── application/      ← use cases por acción (start, attempt, complete, …)
└── infrastructure/
    ├── controllers/
    ├── persistence/
    ├── selectors/    ← lectura cross-BC de flashcards (SQL)
    ├── providers/    ← weakest flashcards vía ProgressModule
    └── framework/    ← GamingModule + exception registry
```

BC **publisher-only**: no consume domain events de otros BCs.

Taxonomía de scope (módulo/subcategoría): `@/shared/domain/subcategory-taxonomy.ts`.

## Endpoints

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| `POST` | `/games` | JWT o guest | envelope `{ gameId, flashcardIds }` |
| `POST` | `/games/:id/attempts` | JWT o guest | 204 void |
| `POST` | `/games/:id/views` | JWT o guest | 204 void (modo study) |
| `POST` | `/games/:id/complete` | JWT o guest | envelope (summary stats) |
| `GET` | `/games/:id/summary` | JWT o guest | envelope |
| `PATCH` | `/games/:id` | JWT | 204 void (`status: paused \| abandoned`) |
| `GET` | `/games?status=paused` | JWT | envelope |
| `POST` | `/games/:id/resume` | JWT | envelope |
| `GET` | `/games/:id/flashcards` | JWT o guest | envelope |
| `GET` | `/games/stats?period=` | JWT admin/teacher | envelope |

## Eventos publicados

| Evento | Exchange | Cuándo |
|--------|----------|--------|
| `AttemptRecorded` | `ididntcatchthat.gaming.attempts.attempt.recorded` | Respuesta registrada (modo game) |
| `FlashcardViewed` | `ididntcatchthat.gaming.views.flashcard.viewed` | Flashcard vista (modo study) |
| `GameCompleted` | `ididntcatchthat.gaming.games.game.completed` | Partida completada |
| `GamePaused` | `ididntcatchthat.gaming.games.game.paused` | Partida pausada |
| `GameAbandoned` | `ididntcatchthat.gaming.games.game.abandoned` | Partida abandonada |

## Eventos consumidos

Ninguno (Progress, Identity, Achievement y Ranking consumen los eventos anteriores).

### Downstream principal

| Evento | Consumer BC | Efecto |
|--------|-------------|--------|
| `AttemptRecorded` | Progress | UPSERT `user_flashcard_stats` |
| `AttemptRecorded` | Achievement | Incrementa contadores de progreso |
| `AttemptRecorded` | Ranking | Actualiza rankings de precisión |
| `FlashcardViewed` | Progress | Incrementa `times_studied` |
| `FlashcardViewed` | Achievement | Registra módulo estudiado |
| `GameCompleted` | Progress | Recalcula `ModuleProgress` |
| `GameCompleted` | Identity | Actualiza streak |
| `GameCompleted` | Achievement | Evalúa unlocks |
| `GameCompleted` | Ranking | Actualiza `most_active` |

`GamePaused` y `GameAbandoned` se publican pero **no tienen consumers** hoy (reservados para analytics/notifications).

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `games` | Agregado Game |
| `game_flashcards` | Flashcards de la sesión (orden) |
| `attempts` | Intentos por flashcard |
| `game_views` | Vistas en modo study |

## Políticas de dominio

| Policy | Regla |
|--------|-------|
| `GuestGamePolicy` | Máx. 3 partidas/día guest, cardCount ≤ 10 |
| `PausedGamePolicy` | Máx. 5 partidas pausadas por usuario |

## Cross-BC

| Dependencia | Mecanismo |
|-------------|-----------|
| Content flashcards | SQL read (`FlashcardSelector`, queries) |
| Progress weakest | `ProgressModule` → `WEAKEST_FLASHCARD_QUERY` |
| Taxonomía | `@/shared/domain/subcategory-taxonomy` |

## Referencias

- [Spec de Gaming](../../../spec/gaming.md)
- [Game Mechanics](../../../domain/game-mechanics.md)
