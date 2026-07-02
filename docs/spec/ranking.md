# Spec: Ranking — Bounded Context Ranking

**Estado**: Implementado  
**BC**: Ranking  
**Scope**: API (`apps/api/src/ranking/`)  
**Tasks**: [docs/tasks/ranking.md](../tasks/ranking.md)

---

## Responsabilidad

Ranking mantiene una **proyección incremental** (`ranking_user_scores`) actualizada en **write-time** al consumir eventos de dominio. La lectura es un `SELECT` indexado — sin recomputo global ni flags dirty.

Es un **pure consumer** — no emite eventos de dominio.

---

## Patrón

```
Evento de dominio
      ↓
Handler (Subscriber)
      ↓
RankingScoreUpdater  →  RankingScore  →  RankingScoreRepository.save()
      ↓
GET /rankings  →  RankingSearcher  →  RankingLeaderboardQuery (RANK() OVER score)
```

La tabla `ranking_user_scores` guarda el **score por usuario**; el **rank** (posición relativa) se calcula en la lectura vía `RankingLeaderboardQuery`.

## Modelo de dominio

| Elemento | Rol |
| -------- | --- |
| `RankingScore` | Aggregate — fila de proyección; `incrementScore`, `applyScore`, `rename` |
| `RankingId` | Identidad compuesta `(userId, type, period, period_bucket, module)` |
| `RankingKey` | Scope de lectura/escritura — periodo efectivo y módulo |
| `RankingScoreRepository` | `save`, `search`, `match`, `remove` |
| `RankingLeaderboardQuery` | Leaderboard con `RANK()` — no es repository |
| `RankingUserStatsQuery` | Stats cross-BC para recalcular ventanas |
| `RankingProfileQuery` | Usuario elegible (`show_in_ranking = true`) |

---

## Endpoint

| Método | Ruta       | Auth | Descripción                          |
| ------ | ---------- | ---- | ------------------------------------ |
| `GET`  | `/rankings` | JWT  | Top N usuarios + posición del caller |

Query params:

| Param    | Valores                                                                 | Requerido                         |
| -------- | ----------------------------------------------------------------------- | --------------------------------- |
| `type`   | `most_active` \| `most_accurate` \| `top_scorer` \| `best_streak` \| `module_master` | Sí                                |
| `period` | `weekly` \| `monthly` \| `all_time`                                   | Sí                                |
| `module` | `native_sounds` \| `connected_speech` \| `flow_connectors` \| `real_talk` | Solo para `module_master`         |
| `limit`  | 1–50 (default 10)                                                       | No                                |

Solo aparecen usuarios con `show_in_ranking = true` (filas existentes en la proyección).

**Nota:** `best_streak` y `module_master` ignoran el período solicitado y usan siempre `all_time`.

---

## Eventos consumidos

| Exchange | Handler | Actualización en proyección |
| -------- | ------- | --------------------------- |
| `ididntcatchthat.gaming.games.game.completed` | `update_ranking_on_game_completed` | `most_active` +1 (`all_time`); weekly/monthly recalculados para ese usuario |
| `ididntcatchthat.gaming.attempts.attempt.recorded` | `update_ranking_on_attempt_recorded` | `top_scorer` +1 si acierto; `most_accurate` recalculado para ese usuario |
| `ididntcatchthat.identity.streak.updated` | `update_ranking_on_streak_updated` | `best_streak` = `current_streak` |
| `idct.progress.module_progress.module_mastery_level.increased` | `update_ranking_on_module_mastery_level_increased` | `module_master` = `mastery_level` del módulo |

**Sincrónico (sin evento):**

| Acción | Servicio | Efecto |
| ------ | -------- | ------ |
| `PATCH /users/me/ranking-profile` | `RankingProfileUpdated` → `UpdateRankingOnRankingProfileUpdated` | Opt-out → remove; opt-in → backfill |

---

## Modelo de datos

### Tabla `ranking_user_scores`

| Columna         | Tipo          | Notas                                      |
| --------------- | ------------- | ------------------------------------------ |
| `user_id`       | `uuid`        | PK                                         |
| `type`          | `varchar(50)` | Tipo de ranking                            |
| `period`        | `varchar(20)` | `weekly` \| `monthly` \| `all_time`        |
| `period_bucket` | `varchar(20)` | `all` (all_time) o `rolling` (ventanas)    |
| `module`        | `varchar(100)`| `global` o módulo concreto                 |
| `nickname`      | `varchar(30)` | Snapshot del nickname público              |
| `score`         | `decimal`     | Métrica del ranking para ese usuario       |
| `updated_at`    | `timestamp`   |                                            |

PK: `(user_id, type, period, period_bucket, module)`

Índices:

- `idx_ranking_user_scores_leaderboard` → `(type, period, period_bucket, module, score DESC)`
- `idx_ranking_user_scores_user_lookup` → `(type, period, period_bucket, module, user_id)`

### Períodos rolling

`weekly` y `monthly` usan ventanas móviles (7 y 30 días), alineadas con las queries originales:

- **Escritura:** al completar partida o registrar intento, se recalcula el score del usuario para esa ventana.
- **Lectura:** `period_bucket = 'rolling'`.

`all_time` usa `period_bucket = 'all'`.

---

## Métricas por tipo

| Tipo | Score en proyección | Fuente en write-time |
| ---- | ------------------- | -------------------- |
| `most_active` | Partidas completadas (`mode = game`) | +1 en `all_time`; COUNT por usuario en weekly/monthly |
| `most_accurate` | `AVG(accuracy_rate)` de flashcards con `times_played > 0` en ventana | Query scoped al usuario desde `user_flashcard_stats` |
| `top_scorer` | Suma de aciertos en ventana | +1 por intento correcto en modo juego |
| `best_streak` | `users.current_streak` | Evento `StreakUpdated` |
| `module_master` | `module_progress.mastery_level` | Evento `ModuleMasteryLevelIncreased` |

---

## Respuesta API

```json
{
  "data": {
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "nickname": "player1",
        "score": 42,
        "isMe": false
      }
    ],
    "currentUser": { "rank": 3, "userId": "uuid", "nickname": "me", "score": 30 },
    "viewer": {
      "showInRanking": true,
      "nickname": "me",
      "rank": 3,
      "score": 30,
      "status": "ranked"
    }
  }
}
```

| Campo | Descripción |
| ----- | ----------- |
| `entries[].isMe` | `true` si la fila corresponde al caller JWT |
| `currentUser` | Posición del caller; `null` si no está rankeado (score 0 o sin fila) |
| `viewer` | Siempre presente para el caller autenticado |

### `viewer.status`

| Valor | Condición |
| ----- | --------- |
| `hidden` | `show_in_ranking = false` |
| `visible_unranked` | Opt-in pero sin fila en proyección o `score <= 0` |
| `ranked` | Tiene rank y score > 0 en la proyección para el scope solicitado |

`currentUser` es `null` si el usuario no tiene score en la proyección o su score es 0. `viewer` sigue reflejando opt-in y nickname aunque `currentUser` sea null.

Si el usuario está en la proyección pero fuera del top N devuelto, `currentUser` se resuelve con una query adicional por `user_id`.

---

## Cliente

Ver [docs/spec/ranking-client.md](./ranking-client.md).

---

## Migraciones

| Migración | Contenido |
| --------- | --------- |
| `Migration202606200410001779990000001` | Tablas legacy `rankings_cache` + `ranking_metadata` (obsoletas) |
| `Migration202606200519001779990000002` | Índices auxiliares en tablas fuente |
| `Migration202606200600001779990000003` | Crea `ranking_user_scores`, elimina tablas legacy |

---

## Docs relacionadas

- Concepto: [docs/domain/ranking.md](../domain/ranking.md)
- Secuencia GET: [docs/apps/api/ranking/find/sequence.md](../apps/api/ranking/find/sequence.md)
- Secuencia update: [docs/apps/api/ranking/update/sequence.md](../apps/api/ranking/update/sequence.md)
