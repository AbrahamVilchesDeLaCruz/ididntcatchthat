# Bounded Contexts — Vista general

Mapa de los bounded contexts de **ididntcatchthat** y los eventos de dominio que fluyen entre ellos.

> **Leyenda de estado**: los BCs sin anotación están **implementados**. Los marcados con `⚠️ Planned` están diseñados pero aún no implementados en código.

---

## Bounded Contexts

```mermaid
graph TB
    Identity["🔐 Identity\n─────────────\nUser\nStreak"]
    Content["📦 Content\n─────────────\nFlashcard"]
    Gaming["🎮 Gaming\n─────────────\nGame\nAttempt\nView"]
    Progress["📈 Progress\n─────────────\nUserFlashcardStats\nModuleProgress"]
    Achievement["🏅 Achievement\n─────────────\nUserAchievement\nUserAchievementProgress\nCatalog"]
    Pronunciation["🎤 Pronunciation ⚠️ Planned\n─────────────\nPronunciationAttempt"]
    Ranking["🏆 Ranking\n─────────────\nRanking\nRankingEntry"]
    Notification["🔔 Notification ⚠️ Planned\n─────────────\nEmailJob\nPushJob"]
    Analytics["📊 Analytics\n─────────────\nPageView\nSummary"]
    Observability["📡 Observability\n─────────────\nPrometheus Metrics"]

    Gaming -->|AttemptRecorded| Progress
    Gaming -->|FlashcardViewed| Progress
    Gaming -->|GameCompleted| Progress
    Gaming -->|GameCompleted| Identity
    Gaming -->|FlashcardViewed| Identity
    Gaming -->|GameCompleted| Achievement
    Gaming -->|AttemptRecorded| Achievement
    Gaming -->|FlashcardViewed| Achievement
    Gaming -->|AttemptRecorded| Ranking
    Gaming -->|GameCompleted| Ranking

    Content -->|FlashcardCreated| Content
    Content -->|FlashcardExamplesCompleted| Content
    Content -->|FlashcardExpressionUpdated| Content
    Content -->|FlashcardExamplesUpdated| Content
    Content -->|FlashcardMeaningUpdated| Content
    Content -->|FlashcardPhoneticsCompleted| Content

    Identity -->|UserRegistered| Notification
    Identity -->|StreakUpdated| Notification
    Identity -->|StreakUpdated| Achievement
    Identity -->|StreakBroken| Notification
    Identity -->|GuestProgressMigrated| Progress

    Progress -->|ModuleMasteryLevelIncreased| Notification
    Progress -->|ModuleMasteryLevelIncreased| Ranking
    Progress -->|ModuleMasteryLevelIncreased| Achievement

    Achievement -->|AchievementUnlocked| Notification

    Pronunciation -->|PronunciationEvaluated ⚠️| Progress
```

---

## Flujo de eventos — tabla resumen

| Evento | Exchange | Emitido por | Consumido por | Efecto |
|--------|----------|-------------|---------------|--------|
| `FlashcardCreated` | `ididntcatchthat.content.flashcard.created` | Content | Content (interno) | Dispara enriquecimiento AI secuencial (examples + phonetics) |
| `FlashcardExamplesCompleted` | `ididntcatchthat.content.flashcard.examples_completed` | Content | Content (interno) | Genera audio tras completar examples |
| `FlashcardPhoneticsCompleted` | `ididntcatchthat.content.flashcard.phonetics_completed` | Content | Content (interno) | Marca phonetics como listas |
| `FlashcardExpressionUpdated` | `ididntcatchthat.content.flashcard.expression_updated` | Content | Content (interno) | Regenera audio tras editar expression |
| `FlashcardExamplesUpdated` | `ididntcatchthat.content.flashcard.examples_updated` | Content | Content (interno) | Regenera audio tras editar examples |
| `FlashcardMeaningUpdated` | `ididntcatchthat.content.flashcard.meaning_updated` | Content | — | Auditoría / futuros consumidores |
| `FlashcardAudioGenerating` | `ididntcatchthat.content.flashcard.audio_generating` | Content | — | Estado intermedio — observabilidad |
| `FlashcardAudioReady` | `ididntcatchthat.content.flashcard.audio_ready` | Content | — | Audio disponible en CDN |
| `FlashcardAudioFailed` | `ididntcatchthat.content.flashcard.audio_failed` | Content | — | Fallo en generación — alerta |
| `AttemptRecorded` | `ididntcatchthat.gaming.attempts.attempt.recorded` | Gaming | Progress | Actualiza `user_flashcard_stats`; en partidas random recalcula `ModuleProgress` por módulo de flashcard |
| `FlashcardViewed` | `ididntcatchthat.gaming.views.flashcard.viewed` | Gaming | Progress | Incrementa `times_studied` en modo study (event-driven async) |
| `AttemptRecorded` | `ididntcatchthat.gaming.attempts.attempt.recorded` | Gaming | Ranking | Actualiza `most_accurate` y `top_scorer` vía aggregate `Ranking` |
| `AttemptRecorded` | `ididntcatchthat.gaming.attempts.attempt.recorded` | Gaming | Achievement | Incrementa `total_played_attempts` en `user_achievement_progress` |
| `FlashcardViewed` | `ididntcatchthat.gaming.views.flashcard.viewed` | Gaming | Achievement | Registra módulo tocado en `user_achievement_progress` |
| `GameCompleted` | `ididntcatchthat.gaming.games.game.completed` | Gaming | Progress | Recalcula `ModuleProgress` (módulo fijo o batch en random) |
| `GameCompleted` | `ididntcatchthat.gaming.games.game.completed` | Gaming | Identity | Incrementa streak si no se incrementó hoy |
| `FlashcardViewed` | `ididntcatchthat.gaming.views.flashcard.viewed` | Gaming | Identity | Incrementa streak en modo study (primera actividad del día) |
| `GameCompleted` | `ididntcatchthat.gaming.games.game.completed` | Gaming | Achievement | Evalúa y desbloquea logros (game/study) |
| `GameCompleted` | `ididntcatchthat.gaming.games.game.completed` | Gaming | Ranking | Actualiza `most_active` vía aggregate `Ranking` |
| `AchievementUnlocked` | `ididntcatchthat.achievement.user_achievement.unlocked` | Achievement | Notification ⚠️ Planned | Toast in-app; push/email — Notification BC no implementado |
| `UserRegistered` | `ididntcatchthat.identity.user.registered` | Identity | Notification ⚠️ Planned | Email bienvenida (Resend) — Notification BC no implementado |
| `StreakUpdated` | `ididntcatchthat.identity.streak.updated` | Identity | Notification ⚠️ Planned | Toast + push si hito (7, 30, 100 días) — Notification BC no implementado |
| `StreakUpdated` | `ididntcatchthat.identity.streak.updated` | Identity | Achievement | Desbloquea logros streak_7/30/100 |
| `StreakUpdated` | `ididntcatchthat.identity.streak.updated` | Identity | Ranking | Actualiza `best_streak` vía aggregate `Ranking` |
| `StreakBroken` | `ididntcatchthat.identity.streak.broken` | Identity | Notification ⚠️ Planned | Email + push — Notification BC no implementado |
| `RankingProfileUpdated` | `ididntcatchthat.identity.user.ranking_profile_updated` | Identity | Ranking | Sincroniza opt-in/out y nickname en tablas de ranking |
| `GuestProgressMigrated` | `ididntcatchthat.identity.user.guest_progress_migrated` | Identity | Gaming | Reasigna `games.user_id` de guest → usuario registrado |
| `GuestProgressMigrated` | `ididntcatchthat.identity.user.guest_progress_migrated` | Identity | Progress | Importa attempts de games migrados → `user_flashcard_stats` |
| `SessionStarted` | `ididntcatchthat.identity.session.started` | Identity | — | Observabilidad / futuros consumidores |
| `SessionRevoked` | `ididntcatchthat.identity.session.revoked` | Identity | — | Logout |
| `SessionRotated` | `ididntcatchthat.identity.session.rotated` | Identity | — | Refresh token |
| `SessionCompromised` | `ididntcatchthat.identity.session.compromised` | Identity | — | Reuse detection |
| `ModuleMasteryLevelIncreased` | `idct.progress.module_progress.module_mastery_level.increased` | Progress | Notification ⚠️ Planned | Toast de logro — Notification BC no implementado |
| `ModuleMasteryLevelIncreased` | `idct.progress.module_progress.module_mastery_level.increased` | Progress | Achievement | Desbloquea module_mastery_2/3 |
| `ModuleMasteryLevelIncreased` | `idct.progress.module_progress.module_mastery_level.increased` | Progress | Ranking | Actualiza `module_master` vía aggregate `Ranking` |
| `PronunciationEvaluated` | `idct.pronunciation.attempt.evaluated` | Pronunciation ⚠️ Planned | Progress | Actualiza pronunciation stats — BC Pronunciation no implementado |

---

## Dirección de dependencias

- **Analytics** es un BC **sin eventos** — escribe `page_views` y lee tablas de otros BCs vía SQL para el read model `summary`. No emite ni consume domain events.
- **Observability** expone métricas Prometheus de runtime (`GET /v1/metrics/summary`) — separado de Analytics (histórico persistente).
- **Content** se autogestiona el audio — sus eventos son internos al propio BC.
- **Notification** ⚠️ **Planned** — BC diseñado, no implementado. Los eventos que debería consumir se emiten correctamente; solo falta el subscriber.
- **Pronunciation** ⚠️ **Planned** — BC diseñado, no implementado. Azure Speech Service pendiente de integrar.
- **Progress** es el **hub central** — recibe de Gaming e Identity, y alimenta a Ranking y Achievement. La integración con Pronunciation es futura.
- **`ModuleMasteryLevelIncreased`** dispara notificaciones y actualiza el ranking de maestros del módulo vía aggregate `Ranking`.
