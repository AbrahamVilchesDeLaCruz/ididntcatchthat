# Ranking BC — Documentación

> Bounded Context responsable de las clasificaciones de usuario. Proyección write-time en `ranking_user_scores`, lectura con `RANK()`.

**Spec**: [docs/spec/ranking.md](../../spec/ranking.md)

## Submódulos DDD

```
ranking/
├── shared/                 ← VOs cross-módulo (RankingType, RankingPeriod, RankingKey), puerto RankingProfileQuery, RankingModule + exception registry
├── projection/             ← write-time — RankingScoreWriter, RecordRanking*, subscribers AMQP, RankingScoreRepository, RankingUserStatsQuery
└── search/                 ← read-time — RankingSearcher, RankingLeaderboardQuery, RankingViewerProjector, GET /rankings
```

`RankingKey.create(type, period, module)` resuelve el módulo efectivo (`module_master` requiere `module`; resto → `GLOBAL_MODULE_SCOPE`) y el período efectivo (`best_streak` / `module_master` siempre `all_time`).

## Endpoints

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| `GET`  | `/rankings?type=&period=&module=&limit=` | JWT | envelope `{ entries, currentUser, viewer }` |

- `type` ∈ `most_active | most_accurate | top_scorer | best_streak | module_master`
- `period` ∈ `weekly | monthly | all_time` (`best_streak` / `module_master` ignoran el parámetro y se resuelven a `all_time`)
- `module` ∈ `LEARNING_MODULES` — obligatorio cuando `type = module_master`
- `limit` 1-50, default 10

## Eventos publicados

Ninguno. `RankingScoreWriter` muta el agregado `Ranking` directamente en la fila de `ranking_user_scores` — no se publica domain event al cambiar un score. Otros BCs descubren los cambios consultando el read model vía `RankingLeaderboardQuery`.

## Eventos consumidos (AMQP)

| Evento | Subscriber | Cola | Tipos ranking afectados |
|--------|-----------|------|------------------------|
| `GameCompleted` (`mode = game`) | `RankingUpdaterOnGameCompleted` | `ranking.update_ranking_on_game_completed` | `most_active` (all_time +1; weekly/monthly recalculados vía `countCompletedGames`) |
| `AttemptRecorded` (`mode = game`) | `RankingUpdaterOnAttemptRecorded` | `ranking.update_ranking_on_attempt_recorded` | `top_scorer` (`sumCorrectCount` en ventana), `most_accurate` (`avgAccuracy` en ventana) |
| `StreakUpdated` | `RankingUpdaterOnStreakUpdated` | `ranking.update_ranking_on_streak_updated` | `best_streak` (all_time) |
| `ModuleMasteryLevelIncreased` | `RankingUpdaterOnModuleMasteryLevelIncreased` | `ranking.update_ranking_on_module_mastery_level_increased` | `module_master` (all_time por módulo) |
| `RankingProfileUpdated` | `RankingUpdaterOnRankingProfileUpdated` | `ranking.update_ranking_on_ranking_profile_updated` | `SyncRankingProfile` → opt-out (`removeAllForUser`) o backfill (`renameAllForUser` + `RankingUserStatsQuery`) |

`RecordRankingAttempt` y `RecordRankingGameCompleted` descartan el evento cuando `mode !== 'game'` o cuando el usuario no es elegible (`RankingProfileQuery.findEligibleUser` → `show_in_ranking`).

### Pipeline async

```
GameCompleted ─────► RankingUpdaterOnGameCompleted
AttemptRecorded ───► RankingUpdaterOnAttemptRecorded
StreakUpdated ─────► RankingUpdaterOnStreakUpdated
ModuleMasteryLevelIncreased ─► RankingUpdaterOnModuleMasteryLevelIncreased
RankingProfileUpdated ──────► RankingUpdaterOnRankingProfileUpdated → SyncRankingProfile

Cada handler → RankingScoreWriter → RankingScoreRepository → ranking_user_scores (UPSERT)
```

No hay re-emisión de eventos hacia otros BCs.

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `ranking_user_scores` | Proyección write-time. PK compuesta `(user_id, type, period, period_bucket, module)`. `period_bucket = 'all'` para `all_time`, `'rolling'` para weekly/monthly. `score decimal(12,4)` para soportar promedios de accuracy. |

## Paridad

- Eligibility: `RankingProfileQuery` se implementa en `IdentityRankingProfileAdapter` (search) delegando a `RankingEligibilityQuery` exportado por Identity.
- Backfill vs write-time: las queries en `RankingUserStatsQuery` (`countCompletedGames`, `avgAccuracy`, `sumCorrectCount`) deben producir el mismo valor que la última versión persistida — `RecordRankingAttempt` y `RecordRankingGameCompleted` recalculan la ventana completa en cada evento.
- Inbox `processed_events` (shared) garantiza idempotencia por subscriber.
- Periodos canónicos: solo `weekly | monthly | all_time` — sin `daily`.

## Perfil de ranking (Identity → Ranking)

| Acción | Flujo |
|--------|-------|
| `PATCH /users/me/ranking-profile` | Identity publica `RankingProfileUpdated` → `RankingUpdaterOnRankingProfileUpdated` → `SyncRankingProfile` |

`SyncRankingProfile` decide:

- `show_in_ranking = false` → `RankingScoreWriter.removeAllForUser(userId)` — borra todas las filas del usuario
- `show_in_ranking = true` (opt-in / backfill) → `renameAllForUser(userId, nickname)` para refrescar el nickname en filas existentes + `backfillUser(userId, nickname)` que recalcula histórico vía `RankingUserStatsQuery`:
  - `most_active` por `countCompletedGames` en cada periodo (`weekly` / `monthly` / `all_time`)
  - `most_accurate` por `avgAccuracy` en cada periodo
  - `top_scorer` por `sumCorrectCount` en cada periodo
  - `best_streak` (all_time) desde `users.current_streak` (vía `RankingProfileQuery.findEligibleUser`)
  - `module_master` (all_time, por módulo) desde `RankingUserStatsQuery.moduleMasteryLevels`

## ACL Identity

Ranking no lee `users` directamente. `IdentityRankingProfileAdapter` implementa `RankingProfileQuery` (`findEligibleUser`, `findUserRankingPreferences`) delegando a `RankingEligibilityQuery` exportado por `IdentityModule`.

## Application

| Use case | Submódulo | Trigger / evento | Tipos ranking |
|----------|-----------|------------------|---------------|
| `RankingSearcher` | search | `GET /rankings` | — |
| `RecordRankingGameCompleted` | projection | `GameCompleted` | `most_active` (weekly/monthly/all_time) |
| `RecordRankingAttempt` | projection | `AttemptRecorded` | `top_scorer`, `most_accurate` (weekly/monthly/all_time) |
| `RecordRankingStreakUpdated` | projection | `StreakUpdated` | `best_streak` (all_time) |
| `RecordRankingModuleMastery` | projection | `ModuleMasteryLevelIncreased` | `module_master` (all_time, por módulo) |
| `SyncRankingProfile` | projection | `RankingProfileUpdated` | Todas las filas del usuario (rename / remove / backfill) |

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Find Rankings](./find/) | `GET /rankings` — top N + posición del caller | [Clases](./find/classes.md) · [Secuencia](./find/sequence.md) · [Casos de uso](./find/usecases.md) |
| [Update Ranking](./update/) | Subscribers AMQP que proyectan scores | [Clases](./update/classes.md) · [Secuencia](./update/sequence.md) · [Casos de uso](./update/usecases.md) |

## Referencias

- [Spec de Ranking](../../spec/ranking.md)
- [Domain doc: Ranking](../../domain/ranking.md)
- [Ranking client spec](../../spec/ranking-client.md)