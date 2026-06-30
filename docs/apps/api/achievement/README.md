# Achievement BC

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/achievements` | Catálogo v2 + estado desbloqueado por usuario |

Query: `since` (ISO8601) — filtra logros desbloqueados después de esa fecha.

**Respuesta:** `{ key, category, sortOrder, unlockedAt }[]` — copy en i18n del cliente.

## Eventos publicados

| Evento | Handler emisor | Atributos |
|--------|----------------|-----------|
| `AchievementUnlocked` | `AchievementUnlocker` | `userId`, `achievementKey`, `category`, `unlockedAt` |

## Eventos consumidos

| Evento | Handler | Logros |
|--------|---------|--------|
| `GameCompleted` (`mode=game`) | `UnlockAchievementOnGameCompleted` | first_game, weak_warrior, perfect_session_10, cards_100, games_10, module_all_touched |
| `GameCompleted` (`mode=study`) | `UnlockAchievementOnGameCompleted` | study_first, study_sessions_10 |
| `StreakUpdated` | `UnlockAchievementOnStreakUpdated` | streak_7, streak_30, streak_100 |
| `ModuleMasteryLevelIncreased` | `UnlockAchievementOnModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |

## Catálogo v2 (14 logros)

Ver [docs/spec/achievements.md](../../../../docs/spec/achievements.md).

## Tablas

- `achievement_catalog` — keys, category, sort_order (+ title/description legacy para FK seed)
- `user_achievements` — PK `(user_id, achievement_key)`
