# Achievements (Logros) v2

**Estado**: En progreso  
**Rama**: `feat/achievements-v2`  
**BC**: `apps/api/src/achievement/`  
**Cliente**: galería en `/profile#achievements`

---

## Objetivos

- Galería de logros en **perfil** (identidad gamificada), no en `/stats`
- Catálogo v2: 14 logros en 4 categorías con iconos Lucide por categoría
- i18n en cliente (API devuelve `key`, `category`, `sortOrder`, `unlockedAt`)
- Evento `AchievementUnlocked` + toast in-app post-desbloqueo
- Progreso incremental en `user_achievement_progress` (contadores y módulos tocados)

Ver también: [ADR-028](../adr/028-achievements-system.md) (catálogo v1). El sistema v2 implementado (3 sub-módulos: `catalog`, `progress`, `user-achievement`) difiere de la primera versión del ADR — ver [docs/apps/api/achievement/README.md](../apps/api/achievement/README.md) para el estado actual.

---

## API

### GET /achievements

Autenticado (JWT). Query opcional `since` (ISO8601): solo logros desbloqueados en o después de esa fecha.

**Respuesta (envelope):**

```json
{
  "data": [
    {
      "key": "first_game",
      "category": "game",
      "sortOrder": 1,
      "unlockedAt": "2026-06-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2026-06-30T12:00:00.000Z",
    "request_id": "req_abc123"
  }
}
```

Documentado en OpenAPI (`/docs`) bajo tag `achievements`.

### Evento publicado

| Evento | Exchange | Emisor | Atributos |
|--------|----------|--------|-----------|
| `AchievementUnlocked` | `ididntcatchthat.achievement.user_achievement.unlocked` | `UserAchievementUnlocker` | `userId`, `achievementKey`, `category`, `unlockedAt` |

### Eventos consumidos

| Evento | Subscriber | Efecto |
|--------|------------|--------|
| `GameCompleted` | `UnlockUserAchievementOnGameCompleted` | Actualiza progreso + evalúa unlocks game/study |
| `AttemptRecorded` | `UpdateAchievementProgressOnAttemptRecorded` | Incrementa `totalPlayedAttempts` (`cards_100`) |
| `FlashcardViewed` | `UpdateAchievementProgressOnFlashcardViewed` | Registra módulo estudiado (`module_all_touched`) |
| `StreakUpdated` | `UnlockUserAchievementOnStreakUpdated` | streak_7, streak_30, streak_100 |
| `ModuleMasteryLevelIncreased` | `UnlockUserAchievementOnModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |

### Logros por evento

| Evento | Logros evaluados |
|--------|------------------|
| `GameCompleted` (`mode=game`) | first_game, weak_warrior, perfect_session_10, cards_100, games_10, module_all_touched |
| `GameCompleted` (`mode=study`) | study_first, study_sessions_10 |
| `StreakUpdated` | streak_7, streak_30, streak_100 |
| `ModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |

---

## Catálogo v2

| Key | Categoría | Trigger |
|-----|-----------|---------|
| `first_game` | game | Primera partida completada (`mode=game`) |
| `perfect_session_10` | game | 100% precisión, ≥10 cartas |
| `cards_100` | game | ≥100 intentos de juego acumulados |
| `weak_warrior` | game | Partida `source=weakest` completada |
| `games_10` | game | 10 partidas completadas |
| `streak_7` | streak | Racha ≥ 7 días |
| `streak_30` | streak | Racha ≥ 30 días |
| `streak_100` | streak | Racha ≥ 100 días |
| `module_mastery_2` | module | Nivel maestría 2 en cualquier módulo |
| `module_mastery_3` | module | Nivel maestría 3 en cualquier módulo |
| `module_all_touched` | module | Al menos 1 intento en cada módulo activo |
| `study_first` | study | Primera sesión de estudio completada |
| `study_sessions_10` | study | 10 sesiones de estudio completadas |

**Reservado (sin handlers):** categoría `pronunciation` — pendiente BC Pronunciation.

**Paridad:** keys del catálogo en dominio = keys en migraciones seed (`achievement-catalog-parity.spec.ts`).

---

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `achievement_catalog` | FK integrity — keys, category, sort_order (+ title/description legacy) |
| `user_achievements` | PK `(user_id, achievement_key)` — desbloqueos |
| `user_achievement_progress` | Contadores y módulos tocados por usuario |

---

## Cliente

### Ubicación

- Sección `#achievements` en [`ProfileComponent`](../../apps/client/src/containers/profile/ProfileComponent.tsx)
- Iconos Lucide por categoría: `Gamepad2`, `Flame`, `Layers`, `BookOpen`

### Toast post-desbloqueo

Tras `POST /games/:id/complete`, el cliente hace poll de `GET /achievements?since={ISO}` con retry (300ms → 1s → 2s) y muestra toast vía Zustand store global.

### i18n

Namespace `achievements.*` — títulos y descripciones por `key` en `en.ts` / `es.ts`.

---

## Fuera de scope v2

- Notification BC (push, email)
- Insignias SVG custom por logro
- Ruta `/achievements` dedicada
- Galería duplicada en `/stats`
