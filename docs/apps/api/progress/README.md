# Progress BC

Bounded context proyector: materializa el progreso del usuario por flashcard y por módulo a partir de eventos de Gaming e Identity.

## Estructura

```
progress/
├── domain/           ← UserFlashcardStats (AggregateRoot), ModuleProgress (AggregateRoot)
├── application/
│   ├── find/         ← ModuleProgressFinder, ProgressSummaryFinder, SubcategoryProgressFinder
│   ├── search/       ← WeakestFlashcardSearcher
│   ├── update/       ← updaters + subscribers AttemptRecorded, FlashcardViewed, GameCompleted
│   └── import/       ← GuestProgressImporter + subscriber GuestProgressMigrated
└── infrastructure/
    ├── controllers/
    └── framework/    ← ProgressModule, ProgressExceptionRegistry
```

## Endpoints

| Método | Ruta | Controller | Auth | Respuesta |
|--------|------|------------|------|-----------|
| `GET` | `/progress/modules` | `SearchModulesProgressGetController` | JWT | envelope |
| `GET` | `/progress/subcategories` | `SearchSubcategoriesProgressGetController` | JWT | envelope |
| `GET` | `/progress/flashcards/weakest?limit=` | `SearchWeakestFlashcardsGetController` | JWT | envelope |
| `GET` | `/progress/summary` | `FindProgressSummaryGetController` | JWT | envelope |

## Eventos consumidos

| Evento | Exchange | Handler | Cola |
|--------|----------|---------|------|
| `AttemptRecorded` | `ididntcatchthat.gaming.attempts.attempt.recorded` | `FlashcardStatsUpdaterOnAttemptRecorded` | `progress.update_flashcard_stats_on_attempt_recorded` |
| `FlashcardViewed` | `ididntcatchthat.gaming.views.flashcard.viewed` | `FlashcardStatsUpdaterOnFlashcardViewed` | `progress.update_flashcard_stats_on_flashcard_viewed` |
| `GameCompleted` | `ididntcatchthat.gaming.games.game.completed` | `ModuleProgressUpdaterOnGameCompleted` | `progress.update_module_progress_on_game_completed` |
| `GuestProgressMigrated` | `ididntcatchthat.identity.user.guest_progress_migrated` | `GuestProgressImporterOnGuestProgressMigrated` | `progress.import_guest_progress_on_guest_progress_migrated` |

## Eventos publicados

| Evento | Exchange | Cuándo |
|--------|----------|--------|
| `ModuleMasteryLevelIncreased` | `idct.progress.module_progress.module_mastery_level.increased` | `ModuleProgress.record()` al subir mastery |

### Pipeline async

```
GameCompleted ─► UpdateModuleProgressOnGameCompleted ─► ModuleProgress.record() ─► ModuleMasteryLevelIncreased
                                                                                        └─► RankingUpdaterOnModuleMasteryLevelIncreased
                                                                                        └─► UnlockUserAchievementOnModuleMasteryLevelIncreased

AttemptRecorded ─► FlashcardStatsUpdaterOnAttemptRecorded ─► UserFlashcardStats.record()
FlashcardViewed ─► FlashcardStatsUpdaterOnFlashcardViewed ─► UserFlashcardStats.record()
GuestProgressMigrated ─► GuestProgressImporterOnGuestProgressMigrated ─► UserFlashcardStats / ModuleProgress import
```

`ModuleMasteryLevelIncreased` se publica con `previousLevel`, `newLevel`, `module`, `userId`, `occurredAt` — Ranking (module_master) y Achievement (module_mastery_2 / module_mastery_3) lo consumen.

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `user_flashcard_stats` | Agregado `UserFlashcardStats` |
| `module_progress` | Agregado `ModuleProgress` |
| `processed_events` | Inbox idempotencia (shared) para guest import |

## Paridad

- **Write-time vs read model**: `UserFlashcardStats.record(attempt)` se aplica en cada `AttemptRecorded`; `WeakestFlashcardQuery` lee directamente las filas ordenadas por `accuracy ASC` — sin recomputo.
- **Mastery threshold**: `StudyLevel` (domain) codifica los umbrales canónicos (0→1→2→3). `RandomModuleProgressUpdater` lo usa para emitir `ModuleMasteryLevelIncreased` solo al cruzar el umbral — emite una sola vez por transición (idempotente vía `previousLevel` en el evento).
- **Guest import**: `GuestProgressImporter` lee de `guest_attempts` (tabla compartida con Gaming) y reproduce el historial en `user_flashcard_stats` + `module_progress` para el nuevo `userId`. No recalcula mastery retroactivo — los módulos ganados durante el período guest se materializan al import.
- **Weakest query**: el query (`TypeOrmWeakestFlashcardQuery`) está expuesto como `WEAKEST_FLASHCARD_QUERY` desde `ProgressModule` para que `GameStarter` (Gaming) lo consuma vía DI token — sin acoplamiento por SQL directo.

## Cross-BC (read ports)

| Dependencia | Mecanismo |
|-------------|-----------|
| Streak en summary | `UserStreakQuery` exportado por IdentityModule |
| Games completed en summary | `UserGamesCompletedQuery` exportado por GamingModule |
| Weakest ids para Gaming | `WEAKEST_FLASHCARD_QUERY` exportado por ProgressModule |
| Random module en attempts | `GameModuleQuery`, `FlashcardModuleQuery` (SQL interno Progress) |

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Find Modules](./find-modules/) | `GET /progress/modules` | [Clases](./find-modules/classes.md) · [Secuencia](./find-modules/sequence.md) · [Casos de uso](./find-modules/usecases.md) |
| [Find Subcategories](./find-subcategories/) | `GET /progress/subcategories` | [Clases](./find-subcategories/classes.md) · [Secuencia](./find-subcategories/sequence.md) · [Casos de uso](./find-subcategories/usecases.md) |
| [Find Progress Summary](./find-progress-summary/) | `GET /progress/summary` | [Clases](./find-progress-summary/classes.md) · [Secuencia](./find-progress-summary/sequence.md) · [Casos de uso](./find-progress-summary/usecases.md) |
| [Weakest Flashcards](./weakest-flashcards/) | `GET /progress/flashcards/weakest` | [Clases](./weakest-flashcards/classes.md) · [Secuencia](./weakest-flashcards/sequence.md) · [Casos de uso](./weakest-flashcards/usecases.md) |
| [Update Flashcard Stats](./update-flashcard-stats/) | AMQP: AttemptRecorded, FlashcardViewed | [Clases](./update-flashcard-stats/classes.md) · [Secuencia](./update-flashcard-stats/sequence.md) · [Casos de uso](./update-flashcard-stats/usecases.md) |
| [Update Module Progress](./update-module-progress/) | AMQP: GameCompleted | [Clases](./update-module-progress/classes.md) · [Secuencia](./update-module-progress/sequence.md) · [Casos de uso](./update-module-progress/usecases.md) |
| [Import Guest Progress](./import-guest-progress/) | AMQP: GuestProgressMigrated | [Clases](./import-guest-progress/classes.md) · [Secuencia](./import-guest-progress/sequence.md) · [Casos de uso](./import-guest-progress/usecases.md) |

## Referencias

- [Domain doc: Progress](../../../domain/progress.md)
- [Spec de Progress](../../../spec/progress.md)
- [RabbitMQ design](../../../domain/rabbitmq-design.md)
- [Bounded contexts](../../../domain/bounded-contexts.md)
