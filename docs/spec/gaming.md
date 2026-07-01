# Spec: Gaming — Bounded Context Gaming

**Estado**: Borrador  
**Fecha**: 2026-05-25  
**BC**: Gaming  
**Scope**: API (`apps/api/src/gaming/`)  
**Tasks**: [docs/tasks/gaming.md](../tasks/gaming.md)

---

## Casos de uso por actor

| Actor              | Caso de uso                     | Endpoint                                |
| ------------------ | ------------------------------- | --------------------------------------- |
| Guest              | Iniciar partida                 | `POST /games`                           |
| Guest              | Registrar intento               | `POST /games/:id/attempts`              |
| Guest              | Completar partida               | `POST /games/:id/complete`              |
| User               | Iniciar partida                 | `POST /games`                           |
| User               | Registrar intento               | `POST /games/:id/attempts`              |
| User               | Completar partida               | `POST /games/:id/complete`              |
| User               | Pausar partida                  | `PATCH /games/:id` `{ status: paused }` |
| User               | Listar partidas pausadas        | `GET /games?status=paused`              |
| User               | Retomar partida                 | `GET /games/:id/resume`                 |
| User               | Abandonar partida               | `PATCH /games/:id` `{ status: abandoned }` |

> Los guests pueden jugar hasta **3 partidas de máximo 10 cartas por día**. No pueden pausar.  
> Los usuarios registrados no tienen límite diario. Pueden pausar hasta **5 juegos simultáneos**.

---

## Modelo de clases

### Jerarquía de Value Objects

```
StringValueObject (shared)
  ├── GameId       — UUID v4, generate()
  ├── AttemptId    — UUID v4, generate()
  ├── GameMode     — enum: study | game
  ├── GameModule   — enum: native_sounds | connected_speech | flow_connectors | real_talk | random
  ├── CardCount    — enum: 10 | 20 | 50
  └── GameStatus   — enum: in_progress | paused | completed | abandoned
```

### Aggregate `Game`

```
Game extends AggregateRoot<GamePrimitives>
  ├── id: GameId
  ├── userId: string | null           — null para guests (migración futura)
  ├── mode: GameMode
  ├── module: GameModule | null       — null = random
  ├── cardCount: CardCount
  ├── status: GameStatus
  ├── flashcardIds: string[]          — ordenadas, definidas al crear
  ├── lastFlashcardId: string | null
  ├── startedAt: Date
  ├── finishedAt: Date | null
  └── attempts: Attempt[]             — entidades internas

  + start(userId, mode, module, cardCount, flashcardIds): Game  [static]
  + recordAttempt(flashcardId, correct): void
  + pause(lastFlashcardId): void
  + resume(): Attempt[]               — retorna attempts ya registrados
  + complete(): void
  + abandon(): void
  + pendingFlashcardIds(): string[]   — flashcardIds sin attempt registrado
  + fromPrimitives(p): Game           [static]
  + toPrimitives(): GamePrimitives
```

### Entidad `Attempt`

```
Attempt (Entity — sin AggregateRoot)
  ├── id: string
  ├── gameId: string
  ├── flashcardId: string
  ├── correct: boolean
  └── answeredAt: Date

  + create(gameId, flashcardId, correct): Attempt   [static factory]
```

### Domain Events

```
DomainEvent (shared)
  ├── AttemptRecordedEvent
  │     eventName: ididntcatchthat.gaming.attempts.attempt.recorded
  │     emitido por: Game.recordAttempt()
  │     atributos: gameId, userId, flashcardId, correct, mode, answeredAt
  │
  ├── GameCompletedEvent
  │     eventName: ididntcatchthat.gaming.games.game.completed
  │     emitido por: Game.complete()
  │     atributos: gameId, userId, mode, module, cardCount, startedAt, finishedAt
  │
  ├── GamePausedEvent
  │     eventName: (interno — sin cola)
  │     emitido por: Game.pause()
  │     atributos: gameId, userId, lastFlashcardId
  │
  └── GameAbandonedEvent
        eventName: (interno — sin cola)
        emitido por: Game.abandon()
        atributos: gameId, userId
```

---

## Repositorios e interfaces de dominio

### `GameRepository`

```typescript
// gaming/domain/game.repository.ts
export interface GameRepository {
  save(game: Game): Promise<void>;
  search(id: GameId): Promise<Game | null>;
  match(criteria: Criteria): Promise<Game[]>;
}

export const GAME_REPOSITORY = Symbol('GameRepository');
```

### `FlashcardSelector` (Domain Service interface)

```typescript
// gaming/domain/flashcard-selector.ts
export interface FlashcardSelector {
  select(module: GameModule | null, count: number): Promise<string[]>;
}

export const FLASHCARD_SELECTOR = Symbol('FlashcardSelector');
```

> `FlashcardSelector` es un puerto hacia el BC Content — se implementa en infraestructura como consulta directa a la tabla `flashcards`.

---

## Use Cases (Application Layer)

### `GameStarter`

**Entrada**: `{ userId: string | null, mode: string, module: string | null, cardCount: number }`  
**Salida**: `{ gameId: string, flashcards: FlashcardPrimitive[] }`

**Algoritmo**:
1. Validar que el guest no supere 3 partidas de 10 cartas si `userId === null`.
2. Si `userId` no es null y status pausados >= 5 → lanzar `MaxPausedGamesReached` con lista de pausados.
3. Llamar `FlashcardSelector.select(module, cardCount)` para obtener `flashcardIds`.
4. Crear `Game.start(userId, mode, module, cardCount, flashcardIds)`.
5. Persistir con `GameRepository.save(game)`.
6. Retornar `gameId + flashcards[]` (datos completos de las flashcards desde Content).

### `AttemptRecorder`

**Entrada**: `{ gameId: string, flashcardId: string, correct: boolean, userId: string | null }`  
**Salida**: `void`

**Algoritmo**:
1. Buscar `Game` por id — lanzar `GameNotFound` si no existe.
2. Verificar ownership: `game.userId === userId` — lanzar `GameAccessDenied` si no coincide.
3. Verificar que `game.status === 'in_progress'` — lanzar `GameNotInProgress` si no.
4. Verificar que `flashcardId` pertenece a las `flashcardIds` del game — lanzar `FlashcardNotInGame`.
5. Llamar `game.recordAttempt(flashcardId, correct)` → record `AttemptRecordedEvent`.
6. Persistir con `GameRepository.save(game)`.

### `GameCompleter`

**Entrada**: `{ gameId: string, userId: string | null }`  
**Salida**: `GameSummaryPrimitive`

**Algoritmo**:
1. Buscar `Game` — lanzar `GameNotFound` si no existe.
2. Verificar ownership.
3. Verificar que todos los attempts están registrados (`pendingFlashcardIds().length === 0`) — lanzar `GameNotFinished` si quedan cartas.
4. Llamar `game.complete()` → record `GameCompletedEvent`.
5. Persistir.
6. Retornar resumen: `{ correctCount, totalCount, accuracy, duration }`.

### `GamePauser`

**Entrada**: `{ gameId: string, userId: string, lastFlashcardId: string }`  
**Salida**: `void`

**Algoritmo**:
1. Buscar `Game` — lanzar `GameNotFound` si no existe.
2. Verificar ownership.
3. Verificar `status === 'in_progress'` — lanzar `GameNotInProgress`.
4. Llamar `game.pause(lastFlashcardId)` → record `GamePausedEvent`.
5. Persistir.

### `PausedGamesLister`

**Entrada**: `{ userId: string }`  
**Salida**: `GamePrimitive[]`

**Algoritmo**:
1. Buscar games por `userId` + `status = paused` via Criteria.
2. Retornar lista.

### `GameResumer`

**Entrada**: `{ gameId: string, userId: string }`  
**Salida**: `{ game: GamePrimitive, pendingFlashcardIds: string[] }`

**Algoritmo**:
1. Buscar `Game` — lanzar `GameNotFound` si no existe.
2. Verificar ownership.
3. Verificar `status === 'paused'` — lanzar `GameNotPaused`.
4. Cambiar status a `in_progress` — `game.resume()`.
5. Persistir.
6. Retornar game + `pendingFlashcardIds` (sin attempt registrado).

### `GameAbandoner`

**Entrada**: `{ gameId: string, userId: string }`  
**Salida**: `void`

**Algoritmo**:
1. Buscar `Game` — lanzar `GameNotFound` si no existe.
2. Verificar ownership.
3. Verificar `status === 'in_progress' | 'paused'` — lanzar `GameAlreadyFinished` si `completed | abandoned`.
4. Llamar `game.abandon()` → record `GameAbandonedEvent`.
5. Persistir.

---

## Domain Errors

| Clase                  | Status HTTP | Cuándo                                               |
| ---------------------- | ----------- | ---------------------------------------------------- |
| `GameNotFound`         | 404         | Game no existe en DB                                 |
| `GameAccessDenied`     | 403         | El userId del request no coincide con `game.userId`  |
| `GameNotInProgress`    | 409         | Se intenta operar un game que no está `in_progress`  |
| `GameNotPaused`        | 409         | Se intenta retomar un game que no está `paused`      |
| `GameAlreadyFinished`  | 409         | Se intenta abandonar un game `completed` o ya `abandoned` |
| `GameNotFinished`      | 422         | Se intenta completar con attempts pendientes         |
| `FlashcardNotInGame`   | 422         | `flashcardId` no pertenece a las cartas del game     |
| `MaxPausedGamesReached`| 409         | Usuario ya tiene 5 games pausados                    |
| `GuestLimitExceeded`   | 429         | Guest supera 3 partidas de 10 cartas/día             |

---

## Mapa de endpoints

| Método  | Ruta                    | Use Case             | Auth              |
| ------- | ----------------------- | -------------------- | ----------------- |
| `POST`  | `/games`                | `GameStarter`        | Bearer (any)      |
| `POST`  | `/games/:id/attempts`   | `AttemptRecorder`    | Bearer (any)      |
| `POST`  | `/games/:id/complete`   | `GameCompleter`      | Bearer (any)      |
| `GET`   | `/games/:id/summary`    | `GameSummaryFinder`  | Bearer (any)      |
| `PATCH` | `/games/:id`            | `GamePauser` / `GameAbandoner` | Bearer (user) |
| `GET`   | `/games`                | `PausedGamesLister`  | Bearer (user)     |
| `GET`   | `/games/:id/resume`     | `GameResumer`        | Bearer (user)     |

> Los endpoints con Bearer (any) aceptan tanto tokens de tipo `user` como `guest`.  
> `PATCH /games/:id` distingue la acción por el campo `status` del body: `paused` → `GamePauser`, `abandoned` → `GameAbandoner`.

---

## Estructura de archivos

```
apps/api/src/
  gaming/
    domain/
      game.ts                           ← Aggregate Root
      attempt.ts                        ← Entidad
      game-id.ts                        ← VO
      game-mode.ts                      ← VO enum
      game-module.ts                    ← VO enum
      card-count.ts                     ← VO enum
      game-status.ts                    ← VO enum
      game.repository.ts                ← interface + token GAME_REPOSITORY
      flashcard-selector.ts             ← interface (port) + token FLASHCARD_SELECTOR
      exceptions/
        game-not-found.ts
        game-access-denied.ts
        game-not-in-progress.ts
        game-not-paused.ts
        game-already-finished.ts
        game-not-finished.ts
        flashcard-not-in-game.ts
        max-paused-games-reached.ts
        guest-limit-exceeded.ts
      events/
        attempt-recorded.event.ts
        game-completed.event.ts
        game-paused.event.ts
        game-abandoned.event.ts

    application/
      start/
        game-starter.ts
      attempt/
        attempt-recorder.ts
      complete/
        game-completer.ts
      pause/
        game-pauser.ts
      list-paused/
        paused-games-lister.ts
      resume/
        game-resumer.ts
      abandon/
        game-abandoner.ts

    infrastructure/
      controllers/
        start-game-post.controller.ts
        start-game-post.payload.ts
        record-attempt-post.controller.ts
        record-attempt-post.payload.ts
        complete-game-post.controller.ts
        patch-game-patch.controller.ts
        patch-game.payload.ts
        search-games-get.controller.ts
        resume-game-post.controller.ts
        find-game-summary-get.controller.ts
        search-game-flashcards-get.controller.ts
        search-games-stats-get.controller.ts
        record-view-post.controller.ts
      persistence/
        game.entity.ts
        game-flashcard.entity.ts           ← join table
        typeorm-game.repository.ts
        typeorm-attempt.repository.ts      ← SQL raw (sin entity)
        typeorm-view.repository.ts         ← SQL raw (sin entity)
      selectors/
        typeorm-flashcard-selector.ts      ← implementa FlashcardSelector
      framework/
        gaming.module.ts

apps/api/test/
  gaming/
    domain/
      game-mother.ts
      game-id-mother.ts
      attempt-mother.ts
    application/
      start/
        game-starter.spec.ts
        request-game-starter-mother.ts
      attempt/
        attempt-recorder.spec.ts
        request-attempt-recorder-mother.ts
      complete/
        game-completer.spec.ts
        request-game-completer-mother.ts
      pause/
        game-pauser.spec.ts
        request-game-pauser-mother.ts
      list-paused/
        paused-games-lister.spec.ts
        request-paused-games-lister-mother.ts
      resume/
        game-resumer.spec.ts
        request-game-resumer-mother.ts
      abandon/
        game-abandoner.spec.ts
        request-game-abandoner-mother.ts
    shared/
      infrastructure/
        start-game.e2e-spec.ts
        record-attempt.e2e-spec.ts
        complete-game.e2e-spec.ts
        pause-resume-game.e2e-spec.ts
        abandon-game.e2e-spec.ts
        guest-limits.e2e-spec.ts
        max-paused-games.e2e-spec.ts
```

---

## Criterios de aceptación

### Iniciar partida

- [ ] `POST /games` con usuario registrado crea un game `in_progress` y retorna `gameId + flashcards[]`.
- [ ] `POST /games` con token guest crea game y respeta límite (3 partidas, máx 10 cartas).
- [ ] Guest que supera el límite → 429 `GuestLimitExceeded`.
- [ ] Usuario con 5 games pausados → 409 `MaxPausedGamesReached` con lista de pausados.
- [ ] `module: null` selecciona flashcards de todos los módulos (random).

### Registrar intento

- [ ] `POST /games/:id/attempts` persiste attempt y retorna 204.
- [ ] Attempt sobre game inexistente → 404 `GameNotFound`.
- [ ] Attempt sobre game de otro usuario → 403 `GameAccessDenied`.
- [ ] Attempt sobre game `paused` o `completed` → 409 `GameNotInProgress`.
- [ ] `flashcardId` no pertenece al game → 422 `FlashcardNotInGame`.
- [ ] Se emite `AttemptRecordedEvent`.

### Completar partida

- [ ] `POST /games/:id/complete` marca game como `completed` y retorna resumen.
- [ ] Si hay flashcards sin attempt → 422 `GameNotFinished`.
- [ ] Se emite `GameCompletedEvent`.

### Pausar partida

- [ ] `PATCH /games/:id { status: paused }` marca game como `paused` y persiste `lastFlashcardId`.
- [ ] Solo usuarios registrados pueden pausar (guest → 403).
- [ ] Game no `in_progress` → 409.
- [ ] Se emite `GamePausedEvent` (interno).

### Retomar partida

- [ ] `GET /games/:id/resume` retorna las flashcards pendientes (sin attempt registrado) desde `lastFlashcardId`.
- [ ] Game no `paused` → 409 `GameNotPaused`.
- [ ] El game vuelve a estado `in_progress`.

### Listar pausados

- [ ] `GET /games?status=paused` retorna solo los games pausados del usuario autenticado.

### Abandonar partida

- [ ] `PATCH /games/:id { status: abandoned }` marca game como `abandoned`.
- [ ] Game ya `completed` o `abandoned` → 409 `GameAlreadyFinished`.
- [ ] Se emite `GameAbandonedEvent` (interno).

---

## Notas de implementación

- **`PATCH /games/:id`**: un solo controller que despacha a `GamePauser` o `GameAbandoner` según `status` en el payload.
- **`FlashcardSelector`**: consulta directa a la tabla `flashcards` (cross-table, mismo DB). No llama al BC Content via HTTP — es una query SQL eficiente por `category`.
- **`game_flashcards`**: tabla join que persiste el orden de las cartas. Se inserta en el mismo `save()` que el Game.
- **Eventos internos** (`GamePaused`, `GameAbandoned`): se publican al bus de dominio en memoria pero NO se routean al AMQP (ningún otro BC los consume).
- **Guest limit**: se verifica contando games del `deviceId` con `startedAt >= hoy` y `cardCount <= 10`.
- **`userId` nullable**: se mantiene null para partidas de guest — se rellena cuando el BC Identity emite `GuestProgressMigratedEvent` (fuera de scope de este spec).
- **Accuracy**: no se calcula en este BC. El BC Progress consume `AttemptRecordedEvent` y actualiza `user_flashcard_stats`.
