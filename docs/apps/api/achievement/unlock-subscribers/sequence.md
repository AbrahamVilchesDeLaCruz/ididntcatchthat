# Unlock Subscribers — Diagrama de Secuencia

```mermaid
sequenceDiagram
    participant Src as Gaming / Identity / Progress
    participant Bus as Event Bus
    participant S as Achievement Subscriber
    participant UC as Unlocker / ProgressUpdater
    participant R as Repository
    participant DB as PostgreSQL

    Src->>Bus: DomainEvent
    Bus->>S: on(event)
    S->>UC: evaluate / increment / unlock

    alt GameCompleted (mode=game)
        UC->>UC: GameCompletedAchievementUnlocker.evaluate
        UC->>R: save UserAchievement (idempotent)
        R->>DB: INSERT user_achievements ON CONFLICT DO NOTHING
    else AttemptRecorded
        UC->>R: increment totalPlayedAttempts
        R->>DB: UPSERT user_achievement_progress
    else FlashcardViewed
        UC->>R: record studied module
    else StreakUpdated / ModuleMastery
        UC->>UC: policy match → unlock keys
        UC->>R: save unlocks
    end

    opt nuevo unlock
        UC->>Bus: AchievementUnlockedEvent
    end
```

## Por evento

| Evento | Handler | Logros / efecto |
|--------|---------|-----------------|
| `GameCompleted` (game) | `UnlockUserAchievementOnGameCompleted` | first_game, weak_warrior, perfect_session_10, cards_100, games_10, module_all_touched |
| `GameCompleted` (study) | mismo handler | study_first, study_sessions_10 |
| `AttemptRecorded` | `UpdateAchievementProgressOnAttemptRecorded` | Progreso cards_100 |
| `FlashcardViewed` | `UpdateAchievementProgressOnFlashcardViewed` | Progreso module_all_touched |
| `StreakUpdated` | `UnlockUserAchievementOnStreakUpdated` | streak_7, streak_30, streak_100 |
| `ModuleMasteryLevelIncreased` | `UnlockUserAchievementOnModuleMasteryLevelIncreased` | module_mastery_2, module_mastery_3 |
