# Tasks: Progress — Bounded Context Progress

**Spec**: [docs/spec/progress.md](../spec/progress.md)  
**Tasks**: este archivo (`docs/tasks/progress.md`)  
**Rama de implementación**: `feat/progress-bc`  
**Orden**: secuencial — cada bloque depende del anterior

> **TDD obligatorio**: cada tarea de Application Layer tiene su test `.spec.ts` escrito PRIMERO (Red → Green → Refactor). Los tests E2E son el criterio de aceptación final de cada flujo.

---

## Prerrequisito — Cablear AMQP real en Gaming e Identity

> Estos tasks son **condición necesaria** para que Progress reciba eventos reales. Sin esto, los handlers de Progress nunca se disparan en producción.

- [x] **TASK-PROGRESS-PRE-01** — Mover `AmqpMessageBus` al `SharedModule`
  - `AmqpMessageBus` y `HandlersBootstrapper` pasan a ser providers del `SharedModule` global.
  - Exportarlos con tokens `DOMAIN_EVENT_PUBLISHER`, `DOMAIN_EVENT_CONSUMER`, `HANDLERS_BOOTSTRAPPER`.
  - Verificar que `ContentModule` siga funcionando con este cambio (sus handlers deben seguir iniciándose vía `HandlersBootstrapper`).
  - **Test**: correr `pnpm --filter @ididntcatchthat/api test` — todos los tests existentes deben seguir en verde.

- [x] **TASK-PROGRESS-PRE-02** — Cablear `GamingModule` a AMQP real
  - Reemplazar `{ provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher }` por la inyección del `DOMAIN_EVENT_PUBLISHER` del `SharedModule`.
  - Eliminar import de `NoopDomainEventPublisher` del módulo.
  - **Test**: `pnpm --filter @ididntcatchthat/api test` en verde.

- [x] **TASK-PROGRESS-PRE-03** — Cablear `IdentityModule` a AMQP real
  - Mismo patrón que `GamingModule`.
  - Verificar que `GuestProgressMigratedEvent` se publica al completar una migración de guest.
  - **Test**: `pnpm --filter @ididntcatchthat/api test` en verde.

---

## Bloque 1 — Domain

> TypeScript puro. Sin NestJS, sin TypeORM. Todo testeable sin I/O.

- [x] **TASK-PROGRESS-01** — Value Objects
  - `ProgressUserId` — UUID v4. Extiende `StringValueObject`. Método `generate()`.
  - `ProgressFlashcardId` — UUID v4. Extiende `StringValueObject`. Método `generate()`.
  - `ModuleName` — enum: `native_sounds | connected_speech | flow_connectors | real_talk`. Extiende `StringValueObject`.
  - Archivo: `progress/domain/value-objects/<name>.ts`.
  - **Test (RED primero)**: válido, inválido lanza error shared.
  - Mother: `ProgressUserIdMother.random()`, `ModuleNameMother.random()`.

- [x] **TASK-PROGRESS-02** — Domain Exceptions
  - `UserFlashcardStatsNotFound` — extiende `DomainError` shared.
  - Archivo: `progress/domain/exceptions/user-flashcard-stats-not-found.ts`.
  - Sin prefijo `Error` ni `Exception` en el nombre de clase.

- [x] **TASK-PROGRESS-03** — Domain Event `ModuleLevelUpEvent`
  - `eventName: 'idct.progress.module_progress.module_level.up'`
  - Atributos: `userId`, `module`, `previousLevel`, `newLevel`, `occurredAt`.
  - Archivo: `progress/domain/events/module-level-up.event.ts`.
  - Incluir `fromPrimitives` estático.

- [x] **TASK-PROGRESS-04** — Read Model `ModuleProgress`
  - Clase simple (no aggregate, sin eventos de dominio).
  - Campos: `userId`, `module`, `totalAttempts`, `correctCount`, `accuracy`, `masteryLevel`, `lastPlayedAt`, `updatedAt`.
  - Método estático `computeMasteryLevel(totalAttempts: number, accuracy: number): number`.
  - `fromPrimitives()` / `toPrimitives()`.
  - Archivo: `progress/domain/module-progress.ts`.
  - **Test (RED primero)**:
    - `computeMasteryLevel` retorna 0/1/2/3 según la fórmula especificada.
    - Casos límite: exactamente 5 attempts con 50% accuracy → nivel 1. 4 attempts → nivel 0.
  - Mother: `ModuleProgressMother.random(overrides?)`.

- [x] **TASK-PROGRESS-05** — Aggregate `UserFlashcardStats`
  - Campos: `userId`, `flashcardId`, `timesStudied`, `timesPlayed`, `correctCount`, `accuracyRate`, `lastSeenAt`.
  - `UserFlashcardStats.create(userId, flashcardId): UserFlashcardStats` — nuevo, todo en ceros.
  - `recordStudy(correct: boolean): void` — incrementa `timesStudied`, si `correct` incrementa `correctCount`, recalcula `accuracyRate`.
  - `recordPlay(correct: boolean): void` — incrementa `timesPlayed`, si `correct` incrementa `correctCount`, recalcula `accuracyRate`.
  - `fromPrimitives()` / `toPrimitives()`.
  - Archivo: `progress/domain/user-flashcard-stats.ts`.
  - **Test (RED primero)**:
    - `create` inicializa todo en cero.
    - `recordPlay(true)` incrementa `timesPlayed`, `correctCount`, recalcula `accuracyRate`.
    - `recordPlay(false)` incrementa `timesPlayed`, NO incrementa `correctCount`, recalcula `accuracyRate`.
    - `recordStudy` no afecta `timesPlayed` ni `accuracyRate`.
    - `accuracyRate` = `correctCount / timesPlayed` — división por cero retorna 0.
    - `fromPrimitives` reconstruye sin efectos secundarios.
  - Mother: `UserFlashcardStatsMother.random(overrides?)`, `UserFlashcardStatsMother.withAccuracy(rate)`.

- [x] **TASK-PROGRESS-06** — Interfaces de repositorio
  - `UserFlashcardStatsRepository` + token `USER_FLASHCARD_STATS_REPOSITORY`.
    - `save(stats): Promise<void>`
    - `search(userId, flashcardId): Promise<UserFlashcardStats | null>`
    - `findWeakest(userId, limit): Promise<UserFlashcardStats[]>`
    - `findByModule(userId, module): Promise<UserFlashcardStats[]>`
  - `ModuleProgressRepository` + token `MODULE_PROGRESS_REPOSITORY`.
    - `save(mp): Promise<void>`
    - `findAll(userId): Promise<ModuleProgress[]>`
    - `findByModule(userId, module): Promise<ModuleProgress | null>`
  - Archivos en `progress/domain/`.

---

## Bloque 2 — Application Layer (Use Cases)

- [x] **TASK-PROGRESS-07** — `GetModulesProgressUseCase`
  - Input: `{ userId: string }`.
  - Query: `ModuleProgressRepository.findAll(userId)`.
  - Output: array de `ModuleProgressViewModel` (mapeado desde dominio).
  - **Test (RED primero)**: mock del repositorio, verifica que retorna lista ordenada por `masteryLevel DESC`.
  - Archivo: `progress/application/get-modules-progress/`.

- [x] **TASK-PROGRESS-08** — `GetWeakestFlashcardsUseCase`
  - Input: `{ userId: string, limit?: number }`. Default `limit = 10`, max `50`.
  - Query: `UserFlashcardStatsRepository.findWeakest(userId, limit)`.
  - Output: array de `WeakestFlashcardViewModel`.
  - **Test (RED primero)**: mock del repositorio, verifica respeto del límite y orden ASC por `accuracyRate`.
  - Archivo: `progress/application/get-weakest-flashcards/`.

---

## Bloque 3 — Application Layer (Event Handlers)

- [x] **TASK-PROGRESS-09** — `UpdateFlashcardStatsOnAttemptRecorded`
  - Extiende `Handler` abstracto. Suscrito a `AttemptRecordedEvent`.
  - Flow:
    1. Si `userId = null` → return (guest, skip).
    2. `search(userId, flashcardId)` — si no existe, crear nuevo con `UserFlashcardStats.create(...)`.
    3. Si `mode = study` → `recordStudy(correct)`. Si `mode = game` → `recordPlay(correct)`.
    4. `save(stats)`.
  - **Test (RED primero)**:
    - Guest (userId null) → no llama a repositorio.
    - Nuevo stats → crea y guarda.
    - Stats existente → actualiza y guarda.
    - mode study → llama `recordStudy`, no `recordPlay`.
  - Archivo: `progress/application/handlers/update-flashcard-stats-on-attempt-recorded.ts`.

- [x] **TASK-PROGRESS-10** — `UpdateModuleProgressOnGameCompleted`
  - Extiende `Handler` abstracto. Suscrito a `GameCompletedEvent`.
  - Flow:
    1. Si `module = null` → return (random game, skip).
    2. `findByModule(userId, module)` → obtener todos los `UserFlashcardStats` del módulo.
    3. Calcular `totalAttempts`, `correctCount`, `accuracy`.
    4. `computeMasteryLevel(totalAttempts, accuracy)`.
    5. Comparar con `masteryLevel` anterior (leer `ModuleProgressRepository.findByModule`).
    6. UPSERT `module_progress`.
    7. Si `masteryLevel` subió → publicar `ModuleLevelUpEvent`.
  - **Test (RED primero)**:
    - module null → skip.
    - Primera vez → crea `ModuleProgress` con nivel 0.
    - Nivel sube → publica `ModuleLevelUpEvent`.
    - Nivel no sube → no publica evento.
    - Recálculo idempotente: mismos datos = mismo resultado.
  - Archivo: `progress/application/handlers/update-module-progress-on-game-completed.ts`.

- [x] **TASK-PROGRESS-11** — `ImportGuestProgressOnGuestProgressMigrated`
  - Extiende `Handler` abstracto. Suscrito a `GuestProgressMigratedEvent`.
  - Flow:
    1. Verificar `ProcessedEventsRepository.exists(eventId, handler)` → si existe, skip.
    2. Cargar attempts del `guestDeviceId` desde la capa de datos (requiere acceso read-only a `gaming.attempts`).
    3. Para cada attempt → UPSERT `user_flashcard_stats` para el `userId` real.
    4. `ProcessedEventsRepository.save(eventId, handler)`.
  - **Test (RED primero)**:
    - Evento ya procesado → no hace nada (idempotente).
    - Primer proceso → guarda stats y marca evento como procesado.
  - Archivo: `progress/application/handlers/import-guest-progress-on-guest-progress-migrated.ts`.

---

## Bloque 4 — Infrastructure

- [x] **TASK-PROGRESS-12** — Migración TypeORM: `module_progress`
  - Nueva tabla con PK compuesta `(user_id, module)`.
  - Columnas: `user_id`, `module`, `total_attempts`, `correct_count`, `accuracy`, `mastery_level`, `last_played_at`, `updated_at`.
  - Índice: `idx_module_progress_user ON module_progress(user_id)`.
  - Archivo: `apps/api/src/database/migrations/<timestamp>-CreateModuleProgress.ts`.

- [x] **TASK-PROGRESS-13** — Migración TypeORM: `processed_events`
  - Nueva tabla para Inbox pattern.
  - Columnas: `event_id` (PK), `handler`, `processed_at`.
  - Índice compuesto: `(event_id, handler)` — PK natural.
  - Archivo: `apps/api/src/database/migrations/<timestamp>-CreateProcessedEvents.ts`.

- [x] **TASK-PROGRESS-14** — TypeORM Entity `UserFlashcardStatsEntity`
  - Mapea tabla `user_flashcard_stats`.
  - PK compuesta: `@PrimaryColumn` en `user_id` y `flashcard_id`.
  - Archivo: `progress/infrastructure/persistence/typeorm/user-flashcard-stats.entity.ts`.

- [x] **TASK-PROGRESS-15** — TypeORM Entity `ModuleProgressEntity`
  - Mapea tabla `module_progress`.
  - PK compuesta: `user_id` + `module`.
  - Archivo: `progress/infrastructure/persistence/typeorm/module-progress.entity.ts`.

- [x] **TASK-PROGRESS-16** — TypeORM Entity `ProcessedEventEntity`
  - Mapea tabla `processed_events`.
  - Archivo: `progress/infrastructure/persistence/typeorm/processed-event.entity.ts`.

- [x] **TASK-PROGRESS-17** — Repositorio `TypeOrmUserFlashcardStatsRepository`
  - Implementa `UserFlashcardStatsRepository`.
  - `findWeakest`: `ORDER BY accuracy_rate ASC LIMIT $n`.
  - `findByModule`: JOIN con tabla `flashcards` por `category = module`.
  - Archivo: `progress/infrastructure/persistence/typeorm/typeorm-user-flashcard-stats.repository.ts`.

- [x] **TASK-PROGRESS-18** — Repositorio `TypeOrmModuleProgressRepository`
  - Implementa `ModuleProgressRepository`.
  - `save`: UPSERT — `INSERT ... ON CONFLICT (user_id, module) DO UPDATE`.
  - Archivo: `progress/infrastructure/persistence/typeorm/typeorm-module-progress.repository.ts`.

- [x] **TASK-PROGRESS-19** — Repositorio `TypeOrmProcessedEventsRepository`
  - Métodos: `exists(eventId, handler): Promise<boolean>`, `save(eventId, handler): Promise<void>`.
  - Archivo: `progress/infrastructure/persistence/typeorm/typeorm-processed-events.repository.ts`.

- [x] **TASK-PROGRESS-20** — Controllers `GetModulesProgressController` y `GetWeakestFlashcardsController`
  - `GET /progress/modules` — `@UseGuards(JwtAuthGuard)`, `@CurrentUser()` para `userId`.
  - `GET /progress/flashcards/weakest` — igual, con `@Query('limit')` opcional.
  - Response: envelope estándar `{ data: [...] }`.
  - Archivo: `progress/infrastructure/controllers/`.

- [x] **TASK-PROGRESS-21** — `ProgressModule` NestJS
  - Registra providers: repositorios, use cases, handlers, `HandlersBootstrapper`.
  - Importa `SharedModule` (para logger y `AmqpMessageBus`).
  - Array `HANDLERS`: los 3 handlers AMQP del Bloque 3.
  - Exporta los use cases que necesiten otros módulos (si aplica).
  - Archivo: `progress/infrastructure/framework/progress.module.ts`.
  - Registrar en `AppModule`.

---

## Bloque 5 — Tests E2E

- [x] **TASK-PROGRESS-22** — E2E: `UpdateFlashcardStats` flow completo
  - Publicar evento `AttemptRecordedEvent` en RabbitMQ de test.
  - Esperar procesamiento.
  - `GET /progress/flashcards/weakest` → verificar que aparece la flashcard con stats actualizados.
  - Archivo: `apps/api/test/progress/update-flashcard-stats.e2e-spec.ts`.

- [x] **TASK-PROGRESS-23** — E2E: `UpdateModuleProgress` — nivel sube
  - Publicar suficientes `AttemptRecordedEvent` + `GameCompletedEvent` para subir de nivel 0 a nivel 1.
  - `GET /progress/modules` → verificar `masteryLevel = 1`.
  - Verificar que `ModuleLevelUpEvent` fue publicado al exchange correspondiente.
  - Archivo: `apps/api/test/progress/update-module-progress.e2e-spec.ts`.

- [x] **TASK-PROGRESS-24** — E2E: idempotencia de handlers
  - Publicar el mismo `AttemptRecordedEvent` dos veces (mismo `eventId`).
  - Verificar que `user_flashcard_stats` solo se actualiza una vez.
  - Publicar el mismo `GuestProgressMigratedEvent` dos veces.
  - Verificar que solo se importa una vez (Inbox table).
  - Archivo: `apps/api/test/progress/idempotency.e2e-spec.ts`.
