# Ranking BC — Documentación

> Bounded Context responsable de las clasificaciones de usuario. Persiste scores en `ranking_user_scores`, actualizados en write-time vía el aggregate `Ranking`, y leídos con `RankingSelector` (query con `RANK()`).

**Spec**: [docs/spec/ranking.md](../../spec/ranking.md)

## Flujos

| Flujo | Descripción | Diagramas |
| ----- | ----------- | --------- |
| [Find Rankings](./find/) | `GET /rankings` — top N + posición del caller | [Secuencia](./find/sequence.md) · [Clases](./find/classes.md) · [Casos de uso](./find/usecases.md) |
| [Update Ranking](./update/) | Handlers que actualizan scores al consumir eventos | [Secuencia](./update/sequence.md) · [Clases](./update/classes.md) |

## Endpoint

| Método | Ruta | Auth |
| ------ | ---- | ---- |
| `GET` | `/rankings` | JWT |

## Subscribers AMQP

| Evento | Handler |
| ------ | ------- |
| `GameCompleted` | `update_ranking_on_game_completed` |
| `AttemptRecorded` | `update_ranking_on_attempt_recorded` |
| `StreakUpdated` | `update_ranking_on_streak_updated` |
| `ModuleMasteryLevelIncreased` | `update_ranking_on_module_mastery_level_increased` |

## Sincrónico

| Acción | Servicio |
| ------ | -------- |
| `PATCH /users/me/ranking-profile` | `RankingUpdater.syncProfile` |

## Modelo de dominio

| Elemento | Rol |
| -------- | --- |
| `Ranking` | Aggregate root — `incrementScore`, `applyScore`, `rename` |
| `RankingId` | Identidad compuesta `(userId, type, period, periodBucket, module)` |
| `RankingKey` | Scope de consulta/escritura — resuelve periodo efectivo y módulo |
| `RankingRepository` | Persistencia — `save`, `search`, `match`, `remove` |
| `RankingSelector` | Lectura optimizada con `RANK()` sobre `ranking_user_scores` |
| `RankingUserStatsQuery` | Stats cross-BC para recalcular scores (games, flashcards, mastery) |
| `RankingUserReader` | Usuario elegible (`show_in_ranking = true`) |
