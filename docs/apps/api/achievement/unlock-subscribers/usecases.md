# Unlock Subscribers — Casos de Uso

```mermaid
---
title: Achievement Unlock — Casos de uso (AMQP)
---
graph TB
    Gaming(["Gaming BC"])
    Identity(["Identity BC"])
    Progress(["Progress BC"])

    UC1["Desbloquear logros tras partida"]
    UC2["Desbloquear logros de racha"]
    UC3["Desbloquear logros de mastery"]
    UC4["Actualizar progreso incremental"]
    UC5["Publicar AchievementUnlocked"]

    Gaming --> UC1
    Gaming --> UC4
    Identity --> UC2
    Progress --> UC3
    UC1 --> UC5
    UC2 --> UC5
    UC3 --> UC5
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Idempotencia | PK `(user_id, achievement_key)` — unlock duplicado no falla |
| Progreso | `user_achievement_progress` para contadores antes del unlock |
| Políticas | `AchievementUnlockPolicy` por tipo de evento en `catalog/domain/` |
| Evento | `AchievementUnlocked` publicado solo en unlock nuevo |
| Inbox | `processed_events` para handlers AMQP |

## Colas AMQP

| Handler | Cola |
|---------|------|
| `UnlockUserAchievementOnGameCompleted` | `achievement.unlock_achievement_on_game_completed` |
| `UpdateAchievementProgressOnAttemptRecorded` | `achievement.update_progress_on_attempt_recorded` |
| `UpdateAchievementProgressOnFlashcardViewed` | `achievement.update_progress_on_flashcard_viewed` |
| `UnlockUserAchievementOnStreakUpdated` | `achievement.unlock_achievement_on_streak_updated` |
| `UnlockUserAchievementOnModuleMasteryLevelIncreased` | `achievement.unlock_achievement_on_module_mastery_level_increased` |
