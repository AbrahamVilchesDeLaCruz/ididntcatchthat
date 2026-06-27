# Achievement BC

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/achievements` | Catálogo + estado desbloqueado por usuario |

Query: `since` (ISO8601) — filtra logros desbloqueados después de esa fecha.

## Eventos consumidos

| Evento | Handler | Logros |
|--------|---------|--------|
| `GameCompleted` | `UnlockAchievementOnGameCompleted` | first_game, weak_warrior, perfect_session_10, cards_100 |
| `StreakUpdated` | `UnlockAchievementOnStreakUpdated` | streak_7, streak_30 |
| `ModuleMasteryLevelIncreased` | `UnlockAchievementOnModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |

## Tablas

- `achievement_catalog` — definiciones estáticas (seed en migración)
- `user_achievements` — PK `(user_id, achievement_key)`
