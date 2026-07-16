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

## Paridad

- **Taxonomía**: `@/shared/domain/subcategory-taxonomy.ts` valida que cada `(category, subcategory)` pedido al `GameStarter` exista. Paridad cubierta por `subcategory-taxonomy-parity.spec.ts` (shared).
- **Guest progress → Identity**: cuando un guest se migra a usuario, `GuestProgressMigrated` desde Identity dispara `MigrateGuestGamesOnGuestProgressMigrated` que reconcilia `games` / `attempts` / `views` con el nuevo `userId`.
- **Owner canónico**: `GameStarter` normaliza `userId` ausente a `null` (guest) y `deviceId` a uno nuevo si el payload no lo trae. `GameCompleter` solo contabiliza `mode = 'game'` para `most_active` (ranking) y para `AttemptRecorded` que activa `RecordRankingAttempt`.
- **Pausa / resume**: `GamePauser` rechaza el PATCH si `status !== 'in_progress'`. `GameResumer` requiere `attempts.length === 0` (partida recién retomada, sin re-intentos intermedios).

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

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Start](./start/) | `POST /games` | [Clases](./start/classes.md) · [Secuencia](./start/sequence.md) · [Casos de uso](./start/usecases.md) |
| [Attempt](./attempt/) | `POST /games/:id/attempts` | [Clases](./attempt/classes.md) · [Secuencia](./attempt/sequence.md) · [Casos de uso](./attempt/usecases.md) |
| [Views](./views/) | `POST /games/:id/views` (study) | [Clases](./views/classes.md) · [Secuencia](./views/sequence.md) · [Casos de uso](./views/usecases.md) |
| [Complete](./complete/) | `POST /games/:id/complete` | [Clases](./complete/classes.md) · [Secuencia](./complete/sequence.md) · [Casos de uso](./complete/usecases.md) |
| [Game Summary](./game-summary/) | `GET /games/:id/summary` | [Clases](./game-summary/classes.md) · [Secuencia](./game-summary/sequence.md) · [Casos de uso](./game-summary/usecases.md) |
| [Pause](./pause/) | `PATCH /games/:id` (paused) | [Clases](./pause/classes.md) · [Secuencia](./pause/sequence.md) · [Casos de uso](./pause/usecases.md) |
| [List Paused Games](./list-paused-games/) | `GET /games?status=paused` | [Clases](./list-paused-games/classes.md) · [Secuencia](./list-paused-games/sequence.md) · [Casos de uso](./list-paused-games/usecases.md) |
| [Resume](./resume/) | `POST /games/:id/resume` | [Clases](./resume/classes.md) · [Secuencia](./resume/sequence.md) · [Casos de uso](./resume/usecases.md) |
| [Abandon](./abandon/) | `PATCH /games/:id` (abandoned) | [Clases](./abandon/classes.md) · [Secuencia](./abandon/sequence.md) · [Casos de uso](./abandon/usecases.md) |
| [Game Flashcards](./game-flashcards/) | `GET /games/:id/flashcards` | [Clases](./game-flashcards/classes.md) · [Secuencia](./game-flashcards/sequence.md) · [Casos de uso](./game-flashcards/usecases.md) |
| [Admin Game Stats](./admin-game-stats/) | `GET /games/stats?period=` | [Clases](./admin-game-stats/classes.md) · [Secuencia](./admin-game-stats/sequence.md) · [Casos de uso](./admin-game-stats/usecases.md) |

## Referencias

- [Spec de Gaming](../../../spec/gaming.md)
- [Game Mechanics](../../../domain/game-mechanics.md)
