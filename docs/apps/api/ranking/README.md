# Ranking BC — Documentación

> Bounded Context responsable de las clasificaciones de usuario. Proyección write-time en `ranking_user_scores`, lectura con `RANK()`.

**Spec**: [docs/spec/ranking.md](../../spec/ranking.md)

## Submódulos DDD

| Submódulo | Responsabilidad |
| --------- | --------------- |
| [`shared/`](./shared/) | VOs cross-módulo (`RankingType`, `RankingKey`), puerto `RankingProfileQuery`, NestJS module |
| [`projection/`](./projection/) | Write-time — aggregate `RankingScore`, use cases `RecordRanking*`, subscribers AMQP |
| [`search/`](./search/) | Read-time — `RankingSearcher`, `RankingLeaderboardQuery`, `GET /rankings` |

## Flujos

| Flujo | Descripción | Diagramas |
| ----- | ----------- | --------- |
| [Find Rankings](./find/) | `GET /rankings` — top N + posición del caller | [Secuencia](./find/sequence.md) · [Clases](./find/classes.md) · [Casos de uso](./find/usecases.md) |
| [Update Ranking](./update/) | Subscribers que actualizan scores al consumir eventos | [Secuencia](./update/sequence.md) · [Clases](./update/classes.md) |

## Endpoint

| Método | Ruta | Auth |
| ------ | ---- | ---- |
| `GET` | `/rankings` | JWT |

## Subscribers AMQP

| Evento | Handler (clase) | Cola |
| ------ | --------------- | ---- |
| `GameCompleted` | `RankingUpdaterOnGameCompleted` | `ranking.update_ranking_on_game_completed` |
| `AttemptRecorded` | `RankingUpdaterOnAttemptRecorded` | `ranking.update_ranking_on_attempt_recorded` |
| `StreakUpdated` | `RankingUpdaterOnStreakUpdated` | `ranking.update_ranking_on_streak_updated` |
| `ModuleMasteryLevelIncreased` | `RankingUpdaterOnModuleMasteryLevelIncreased` | `ranking.update_ranking_on_module_mastery_level_increased` |
| `RankingProfileUpdated` | `RankingUpdaterOnRankingProfileUpdated` | `ranking.update_ranking_on_ranking_profile_updated` |

## Perfil de ranking (Identity → Ranking)

| Acción | Flujo |
| ------ | ----- |
| `PATCH /users/me/ranking-profile` | Identity publica `RankingProfileUpdated` → `SyncRankingProfile` vía subscriber |

## ACL Identity

Ranking no lee `users` directamente. `IdentityRankingProfileAdapter` implementa `RankingProfileQuery` delegando a `RankingEligibilityQuery` exportado por Identity.

## Application

| Use case | Submódulo | Rol |
| -------- | --------- | --- |
| `RankingSearcher` | search | `GET /rankings` |
| `RecordRankingGameCompleted` | projection | `most_active` tras partida |
| `RecordRankingAttempt` | projection | `top_scorer` + `most_accurate` |
| `RecordRankingStreakUpdated` | projection | `best_streak` |
| `RecordRankingModuleMastery` | projection | `module_master` |
| `SyncRankingProfile` | projection | opt-out / backfill |
