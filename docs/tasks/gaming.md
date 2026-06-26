# Tasks: Gaming — Bounded Context Gaming

**Spec**: [docs/spec/gaming.md](../spec/gaming.md)  
**Tasks**: este archivo (`docs/tasks/gaming.md`)  
**Rama de implementación**: `feat/gaming-spec`  
**Orden**: secuencial — cada bloque depende del anterior

> **TDD obligatorio**: cada tarea de Application Layer tiene su test `.spec.ts` escrito PRIMERO (Red → Green → Refactor). Los tests E2E son el criterio de aceptación final de cada flujo.

---

## Bloque 1 — Domain

> TypeScript puro. Sin NestJS, sin TypeORM. Todo testeable sin I/O.

- [x] **TASK-GAMING-01** — Value Object `GameId`
  - Extiende `StringValueObject`. UUID v4 válido. Método `GameId.generate()`.
  - **Test (RED primero)**: válido, inválido lanza `GameIdInvalid` (o usar `InvalidArgumentError` shared).
  - Mother: `GameIdMother.random()`, `GameIdMother.create(value)`.

- [x] **TASK-GAMING-02** — Value Objects enum: `GameMode`, `GameModule`, `CardCount`, `GameStatus`
  - Cada uno extiende `StringValueObject`. Factory `create(value)` con validación de enum.
  - `GameMode`: `study | game`.
  - `GameModule`: `native_sounds | connected_speech | flow_connectors | real_talk | random`.
  - `CardCount`: `10 | 20 | 50` (validar como número — internamente string o number, decidir).
  - `GameStatus`: `in_progress | paused | completed | abandoned`.
  - **Test (RED primero)**: valores válidos e inválidos para cada VO.

- [x] **TASK-GAMING-03** — Domain Exceptions
  - `GameNotFound`, `GameAccessDenied`, `GameNotInProgress`, `GameNotPaused`.
  - `GameAlreadyFinished`, `GameNotFinished`, `FlashcardNotInGame`.
  - `MaxPausedGamesReached`, `GuestLimitExceeded`.
  - Todos extienden `DomainError` de shared. Sin sufijo `Error` ni `Exception` en el nombre de clase.
  - Archivo: `gaming/domain/exceptions/<name>.ts`.

- [x] **TASK-GAMING-04** — Domain Events
  - `AttemptRecordedEvent` — `ididntcatchthat.gaming.attempts.attempt.recorded`.
    - Atributos: `gameId`, `userId`, `flashcardId`, `correct`, `mode`, `answeredAt`.
  - `GameCompletedEvent` — `ididntcatchthat.gaming.games.game.completed`.
    - Atributos: `gameId`, `userId`, `mode`, `module`, `cardCount`, `startedAt`, `finishedAt`.
  - `GamePausedEvent` — interno, sin routing AMQP.
    - Atributos: `gameId`, `userId`, `lastFlashcardId`.
  - `GameAbandonedEvent` — interno, sin routing AMQP.
    - Atributos: `gameId`, `userId`.
  - Archivo: `gaming/domain/events/<name>.event.ts`.

- [x] **TASK-GAMING-05** — Entidad `Attempt`
  - Campos: `id`, `gameId`, `flashcardId`, `correct`, `answeredAt`.
  - Factory estática `Attempt.create(gameId, flashcardId, correct): Attempt`.
  - `toPrimitives()` y `fromPrimitives()`.
  - **Test (RED primero)**: `create` genera id único, `fromPrimitives` reconstruye sin efectos.
  - Mother: `AttemptMother.random(overrides?)`.

- [x] **TASK-GAMING-06** — Aggregate `Game`
  - Campos completos según spec.
  - `Game.start(userId, mode, module, cardCount, flashcardIds): Game` — no emite evento.
  - `game.recordAttempt(flashcardId, correct): void` — valida que `flashcardId ∈ flashcardIds`, lanza `FlashcardNotInGame`. Crea `Attempt` y llama `record(new AttemptRecordedEvent(...))`.
  - `game.pause(lastFlashcardId): void` — valida `status === in_progress`, lanza `GameNotInProgress`. Cambia status, llama `record(new GamePausedEvent(...))`.
  - `game.resume(): void` — valida `status === paused`, lanza `GameNotPaused`. Cambia status a `in_progress`.
  - `game.complete(): void` — valida que `pendingFlashcardIds().length === 0`, lanza `GameNotFinished`. Cambia status, llama `record(new GameCompletedEvent(...))`.
  - `game.abandon(): void` — valida `status !== completed && !== abandoned`, lanza `GameAlreadyFinished`. Llama `record(new GameAbandonedEvent(...))`.
  - `pendingFlashcardIds(): string[]` — flashcardIds sin attempt.
  - `fromPrimitives()` / `toPrimitives()`.
  - **Test (RED primero)**:
    - `start` crea game `in_progress` con attempts vacíos.
    - `recordAttempt` crea attempt, emite `AttemptRecordedEvent`, lanza `FlashcardNotInGame` si no pertenece.
    - `pause` cambia status, emite `GamePausedEvent`, lanza `GameNotInProgress` si ya completado.
    - `resume` cambia status a `in_progress`, lanza `GameNotPaused` si no está pausado.
    - `complete` emite `GameCompletedEvent`, lanza `GameNotFinished` si hay pendientes.
    - `abandon` emite `GameAbandonedEvent`, lanza `GameAlreadyFinished` si ya terminó.
    - `pendingFlashcardIds` retorna correctamente las cartas sin attempt.
    - `fromPrimitives` reconstruye sin emitir eventos.
  - Mother: `GameMother.random(overrides?)`, `GameMother.inProgress()`, `GameMother.paused()`, `GameMother.completed()`.

- [x] **TASK-GAMING-07** — Interfaces de repositorio y puerto
  - `GameRepository` + token `GAME_REPOSITORY` en `gaming/domain/game.repository.ts`.
    - Métodos: `save(game): Promise<void>`, `search(id: GameId): Promise<Game | null>`, `match(criteria: Criteria): Promise<Game[]>`.
  - `FlashcardSelector` + token `FLASHCARD_SELECTOR` en `gaming/domain/flashcard-selector.ts`.
    - Método: `select(module: GameModule | null, count: number): Promise<string[]>`.

---

## Bloque 2 — Application (Use Cases)

> Reciben primitivos. Usan repositorios via interface. Mockeados con `jest-mock-extended`.  
> **Test PRIMERO en cada use case** — escribir el `.spec.ts` antes de la implementación.

- [x] **TASK-GAMING-08** — `GameStarter`
  - Archivo: `gaming/application/start/game-starter.ts`.
  - Inyecta: `GameRepository`, `FlashcardSelector`.
  - **Test (RED primero)**:
    - Partida iniciada → game persistido, retorna `gameId + flashcardIds`.
    - Guest con 3 partidas hoy → lanza `GuestLimitExceeded`.
    - Usuario con 5 pausados → lanza `MaxPausedGamesReached` con lista.
    - Módulo `null` → llama a `FlashcardSelector.select(null, count)`.
  - Mother: `RequestGameStarterMother.random()`, `RequestGameStarterMother.guest()`.

- [x] **TASK-GAMING-09** — `AttemptRecorder`
  - Archivo: `gaming/application/attempt/attempt-recorder.ts`.
  - Inyecta: `GameRepository`, `DomainEventPublisher`.
  - **Test (RED primero)**:
    - Attempt registrado → game persistido, evento `AttemptRecordedEvent` publicado.
    - Game inexistente → `GameNotFound`.
    - Ownership incorrecto → `GameAccessDenied`.
    - Game `paused` → `GameNotInProgress`.
    - `flashcardId` inválido → `FlashcardNotInGame`.
  - Mother: `RequestAttemptRecorderMother.random(gameId)`.

- [x] **TASK-GAMING-10** — `GameCompleter`
  - Archivo: `gaming/application/complete/game-completer.ts`.
  - Inyecta: `GameRepository`, `DomainEventPublisher`.
  - **Test (RED primero)**:
    - Game completado → retorna `{ correctCount, totalCount, accuracy, duration }`.
    - Attempts pendientes → `GameNotFinished`.
    - Game inexistente → `GameNotFound`.
    - Ownership incorrecto → `GameAccessDenied`.
    - Evento `GameCompletedEvent` publicado.
  - Mother: `RequestGameCompleterMother.random(gameId)`.

- [x] **TASK-GAMING-11** — `GamePauser`
  - Archivo: `gaming/application/pause/game-pauser.ts`.
  - Inyecta: `GameRepository`.
  - **Test (RED primero)**:
    - Pausa exitosa → status `paused`, `lastFlashcardId` persistido.
    - Game no `in_progress` → `GameNotInProgress`.
    - Game inexistente → `GameNotFound`.
    - Ownership incorrecto → `GameAccessDenied`.
  - Mother: `RequestGamePauserMother.random(gameId)`.

- [x] **TASK-GAMING-12** — `PausedGamesLister`
  - Archivo: `gaming/application/list-paused/paused-games-lister.ts`.
  - Inyecta: `GameRepository`.
  - **Test (RED primero)**:
    - Retorna lista de games `paused` del usuario.
    - Sin games pausados → retorna array vacío.
  - Mother: `RequestPausedGamesListerMother.random(userId)`.

- [x] **TASK-GAMING-13** — `GameResumer`
  - Archivo: `gaming/application/resume/game-resumer.ts`.
  - Inyecta: `GameRepository`.
  - **Test (RED primero)**:
    - Resume exitoso → status `in_progress`, retorna `pendingFlashcardIds`.
    - Game no `paused` → `GameNotPaused`.
    - Game inexistente → `GameNotFound`.
    - Ownership incorrecto → `GameAccessDenied`.
  - Mother: `RequestGameResumerMother.random(gameId)`.

- [x] **TASK-GAMING-14** — `GameAbandoner`
  - Archivo: `gaming/application/abandon/game-abandoner.ts`.
  - Inyecta: `GameRepository`.
  - **Test (RED primero)**:
    - Abandono exitoso → status `abandoned`, evento `GameAbandonedEvent`.
    - Game `completed` → `GameAlreadyFinished`.
    - Game `abandoned` → `GameAlreadyFinished` (idempotente o error).
    - Game inexistente → `GameNotFound`.
    - Ownership incorrecto → `GameAccessDenied`.
  - Mother: `RequestGameAbandonerMother.random(gameId)`.

---

## Bloque 3 — Infrastructure

> NestJS, TypeORM. Cubiertos principalmente por tests E2E.

- [x] **TASK-GAMING-15** — Migración TypeORM `create-gaming`
  - Crea tablas `games`, `game_flashcards`, `attempts` con índices y constraints del spec.
  - Constraints: `card_count IN (10, 20, 50)`, FK entre tablas, índices en `games(user_id, status)`.
  - Siguiendo el skill `api-migrations`.

- [x] **TASK-GAMING-16** — Entidades TypeORM
  - `GameEntity` — mapea tabla `games`.
  - `AttemptEntity` — mapea tabla `attempts`.
  - `GameFlashcardEntity` — mapea tabla `game_flashcards` (join table con `position`).
  - Solo mapeo DB ↔ objeto plano. Sin lógica. Sufijo `Entity`.
  - En `gaming/infrastructure/persistence/`.

- [x] **TASK-GAMING-17** — `TypeOrmGameRepository`
  - Implementa `GameRepository`.
  - `save()`: upsert de `GameEntity` + insert/update de `AttemptEntity[]` y `GameFlashcardEntity[]`.
  - `search(id)`: join con attempts y game_flashcards.
  - `match(criteria)`: usa `CriteriaConverter` de shared.
  - Mapeo explícito via `Game.fromPrimitives()` y `game.toPrimitives()`.

- [x] **TASK-GAMING-18** — `TypeOrmFlashcardSelector`
  - Implementa `FlashcardSelector`.
  - Consulta `flashcards` filtrada por `category` (si module !== null) y `audio_status = 'ready'`.
  - Devuelve IDs en orden aleatorio (RANDOM() en SQL) limitados a `count`.
  - En `gaming/infrastructure/selectors/`.

- [x] **TASK-GAMING-19** — Payloads con `class-validator`
  - `StartGamePostPayload`: `mode` (enum), `module?` (enum nullable), `cardCount` (enum 10|20|50).
  - `RecordAttemptPostPayload`: `flashcardId` (UUID), `correct` (boolean).
  - `PatchGamePayload`: `status` (enum: `paused | abandoned`), `lastFlashcardId?` (UUID, required si paused).
  - Cada payload junto a su controller.

- [x] **TASK-GAMING-20** — Controllers
  - `StartGamePostController` → `POST /games` — retorna `201` con `{ gameId, flashcards[] }`.
  - `RecordAttemptPostController` → `POST /games/:id/attempts` — retorna `204`.
  - `CompleteGamePostController` → `POST /games/:id/complete` — retorna `200` con resumen.
  - `PatchGameController` → `PATCH /games/:id` — despacha a `GamePauser` o `GameAbandoner` según `status`. Retorna `204`.
  - `ListPausedGamesGetController` → `GET /games?status=paused` — retorna `200` con lista.
  - `ResumeGameGetController` → `GET /games/:id/resume` — retorna `200` con `{ game, pendingFlashcardIds }`.

- [x] **TASK-GAMING-21** — Registro de excepciones en `GamingModule`
  - Registrar todos los `DomainError` de este BC en `GlobalExceptionRegistry` siguiendo el skill `api-error-handler`.

- [x] **TASK-GAMING-22** — `GamingModule` NestJS
  - Declara providers con tokens Symbol (`GAME_REPOSITORY`, `FLASHCARD_SELECTOR`).
  - Importa `SharedModule`.
  - Registra controllers.
  - Exporta lo necesario para futuros BCs.
  - Siguiendo skill `api-di`.

---

## Bloque 4 — Tests E2E

> Tests de integración completos. Corren contra DB real (Docker local). Un archivo por flujo.

- [x] **TASK-GAMING-23** — E2E: Iniciar partida (`start-game.e2e-spec.ts`)
  - `POST /games` con user token → 201 + `gameId + flashcards[]`.
  - `POST /games` con guest token → 201.
  - Guest supera límite → 429.
  - Usuario con 5 pausados → 409 con lista.

- [x] **TASK-GAMING-24** — E2E: Registrar intento (`record-attempt.e2e-spec.ts`)
  - Attempt válido → 204.
  - Game inexistente → 404.
  - Game de otro usuario → 403.
  - Game pausado → 409.
  - Flashcard no pertenece al game → 422.

- [x] **TASK-GAMING-25** — E2E: Completar partida (`complete-game.e2e-spec.ts`)
  - Flujo completo (start → attempts → complete) → 200 + resumen.
  - Completar con pendientes → 422.

- [x] **TASK-GAMING-26** — E2E: Pausar y retomar (`pause-resume-game.e2e-spec.ts`)
  - Pausar game `in_progress` → 204, status `paused`.
  - Retomar game `paused` → 200 con flashcards pendientes.
  - Retomar game no pausado → 409.
  - Guest intenta pausar → 403.

- [x] **TASK-GAMING-27** — E2E: Abandonar partida (`abandon-game.e2e-spec.ts`)
  - Abandonar game `in_progress` → 204.
  - Abandonar game `paused` → 204.
  - Abandonar game `completed` → 409.

- [x] **TASK-GAMING-28** — E2E: Límite de juegos pausados (`max-paused-games.e2e-spec.ts`)
  - Crear 5 games y pausarlos → todos 204.
  - Crear el 6to game → 409 con lista de 5 pausados.
  - Abandonar uno → crear nuevo → 201.

- [x] **TASK-GAMING-29** — E2E: Límites de guest (`guest-limits.e2e-spec.ts`)
  - 3 partidas de 10 cartas con guest token → ok.
  - 4ta partida → 429 `GuestLimitExceeded`.
  - Guest intenta `cardCount: 20` → ¿validar en dominio o payload? (decidir en implementación).

---

## Bloque 5 — Documentación

- [x] **TASK-GAMING-30** — Diagramas por feature en `docs/apps/api/gaming/`
  - README con índice de flujos.
  - Por cada flujo (`start/`, `attempt/`, `complete/`, `pause/`, `resume/`, `abandon/`):
    - `sequence.md` — diagrama de secuencia Mermaid.
    - `classes.md` — diagrama de clases Mermaid.
    - `usecases.md` — diagrama de casos de uso Mermaid.
