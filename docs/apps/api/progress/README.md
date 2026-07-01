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

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `user_flashcard_stats` | Agregado `UserFlashcardStats` |
| `module_progress` | Agregado `ModuleProgress` |
| `processed_events` | Inbox idempotencia (shared) para guest import |

## Cross-BC (read ports)

| Dependencia | Mecanismo |
|-------------|-----------|
| Streak en summary | `UserStreakQuery` exportado por IdentityModule |
| Games completed en summary | `UserGamesCompletedQuery` exportado por GamingModule |
| Weakest ids para Gaming | `WEAKEST_FLASHCARD_QUERY` exportado por ProgressModule |
| Random module en attempts | `GameModuleQuery`, `FlashcardModuleQuery` (SQL interno Progress) |

## Flujos detallados

Diagramas por flujo en subcarpetas: [find-modules](./find-modules/), [weakest-flashcards](./weakest-flashcards/), etc.

## Referencias

- [Domain doc: Progress](../../../domain/progress.md)
- [Spec de Progress](../../../spec/progress.md)
- [RabbitMQ design](../../../domain/rabbitmq-design.md)
- [Bounded contexts](../../../domain/bounded-contexts.md)
