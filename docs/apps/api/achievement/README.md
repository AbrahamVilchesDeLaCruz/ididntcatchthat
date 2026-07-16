# Achievement BC

## Submódulos DDD

```
achievement/
├── catalog/          ← definiciones + políticas de unlock (reglas)
├── progress/         ← agregado UserAchievementProgress (contadores / módulos tocados)
├── user-achievement/ ← agregado UserAchievement + búsqueda + unlockers
└── shared/           ← VOs cross-módulo + AchievementModule + exception registry
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/achievements` | Catálogo v2 + estado desbloqueado por usuario |

Query: `since` (ISO8601) — filtra logros desbloqueados después de esa fecha.

**Respuesta:** `{ key, category, sortOrder, unlockedAt }[]` — copy en i18n del cliente.

## Eventos publicados

| Evento | Emisor | Atributos |
|--------|--------|-----------|
| `AchievementUnlocked` | `UserAchievementUnlocker` | `userId`, `achievementKey`, `category`, `unlockedAt` |

## Eventos consumidos

| Evento | Subscriber | Efecto |
|--------|------------|--------|
| `GameCompleted` | `UnlockUserAchievementOnGameCompleted` | Actualiza progreso + evalúa unlocks game/study |
| `AttemptRecorded` | `UpdateAchievementProgressOnAttemptRecorded` | Incrementa `totalPlayedAttempts` (cards_100) |
| `FlashcardViewed` | `UpdateAchievementProgressOnFlashcardViewed` | Registra módulo estudiado (module_all_touched) |
| `StreakUpdated` | `UnlockUserAchievementOnStreakUpdated` | streak_7, streak_30, streak_100 |
| `ModuleMasteryLevelIncreased` | `UnlockUserAchievementOnModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |

### Logros por evento

| Evento | Logros evaluados |
|--------|------------------|
| `GameCompleted` (`mode=game`) | first_game, weak_warrior, perfect_session_10, cards_100, games_10, module_all_touched |
| `GameCompleted` (`mode=study`) | study_first, study_sessions_10 |
| `StreakUpdated` | streak_7, streak_30, streak_100 |
| `ModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |

### Pipeline async

```
GameCompleted (game) ─► UnlockUserAchievementOnGameCompleted ─► GameCompletedAchievementUnlocker.evaluate
                                                                          └─► AchievementUnlockPolicy → AchievementKey[]
                                                                          └─► UserAchievement.unlock() (idempotente)
                                                                                  └─► AchievementUnlockedEvent

GameCompleted (study) ─► UnlockUserAchievementOnGameCompleted ─► StudyCompletedAchievementUnlocker.evaluate
AttemptRecorded ─────► UpdateAchievementProgressOnAttemptRecorded ─► AchievementProgressUpdater.incrementAttempts
FlashcardViewed ─────► UpdateAchievementProgressOnFlashcardViewed ─► AchievementProgressUpdater.recordStudiedModule
StreakUpdated ───────► UnlockUserAchievementOnStreakUpdated ─► StreakAchievementUnlockPolicy.match
ModuleMasteryLevelIncreased ─► UnlockUserAchievementOnModuleMasteryLevelIncreased ─► ModuleMasteryAchievementUnlockPolicy.match
```

`AchievementUnlockedEvent` solo se publica cuando el unlock es nuevo (no idempotente por sí mismo — la idempotencia la da la PK `(user_id, achievement_key)` en `user_achievements`).

## Catálogo v2 (14 logros)

Fuente de verdad en dominio: `AchievementCatalog` (`catalog/domain/achievement-catalog.ts`).

Ver [docs/spec/achievements.md](../../../../docs/spec/achievements.md).

**Paridad:** las keys del catálogo deben coincidir con las migraciones seed (`achievement-catalog-parity.spec.ts`).

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `achievement_catalog` | FK integrity — keys, category, sort_order (+ title/description legacy) |
| `user_achievements` | PK `(user_id, achievement_key)` — desbloqueos |
| `user_achievement_progress` | Contadores y módulos tocados por usuario |

## Cross-BC

| Dependencia | Mecanismo |
|-------------|-----------|
| Events from Gaming | `AttemptRecorded`, `FlashcardViewed`, `GameCompleted` |
| Events from Identity | `StreakUpdated` |
| Events from Progress | `ModuleMasteryLevelIncreased` |
| `AchievementUnlocked` consumers | (reservado — sin consumer actual) |

## Referencias

- [ADR-028: Sistema de logros v2](../../../../docs/adr/028-achievements-system.md)

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Find Achievements](./find-achievements/) | `GET /achievements?since=` | [Clases](./find-achievements/classes.md) · [Secuencia](./find-achievements/sequence.md) · [Casos de uso](./find-achievements/usecases.md) |
| [Unlock Subscribers](./unlock-subscribers/) | AMQP: GameCompleted, AttemptRecorded, … | [Clases](./unlock-subscribers/classes.md) · [Secuencia](./unlock-subscribers/sequence.md) · [Casos de uso](./unlock-subscribers/usecases.md) |
