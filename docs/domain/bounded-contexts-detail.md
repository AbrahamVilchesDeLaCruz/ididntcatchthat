# Bounded Contexts — Detalle por contexto

Eventos que emite y consume cada bounded context, con sus aggregates internos y responsabilidades.

---

## 🔐 Identity

**Responsabilidad**: Gestionar la identidad del usuario, autenticación y racha de actividad.

```mermaid
graph LR
    subgraph Identity ["🔐 Identity"]
        User["User\n(Aggregate Root)"]
        Streak["Streak\n(Entity)"]
        User --- Streak
    end

    subgraph Emits ["Eventos que emite"]
        E1["UserRegistered\nidct.identity.users.user.registered"]
        E2["StreakUpdated\nidct.identity.streaks.streak.updated"]
        E3["StreakBroken\nidct.identity.streaks.streak.broken"]
        E4["GuestProgressMigrated\nidct.identity.users.guest_progress.migrated"]
    end

    subgraph Consumes ["Eventos que consume"]
        C1["GameCompleted\nidct.gaming.games.game.completed"]
    end

    Identity -->|emite| E1
    Identity -->|emite| E2
    Identity -->|emite| E3
    Identity -->|emite| E4
    C1 -->|consume| Identity
```

| Evento emitido | Exchange | Trigger |
|----------------|----------|---------|
| `UserRegistered` | `idct.identity.users.user.registered` | Usuario completa registro (email o OAuth) |
| `StreakUpdated` | `idct.identity.streaks.streak.updated` | `GameCompleted` o sesión de estudio — primera del día |
| `StreakBroken` | `idct.identity.streaks.streak.broken` | Job nocturno detecta que `last_activity_date < ayer` |
| `GuestProgressMigrated` | `idct.identity.users.guest_progress.migrated` | Guest completa registro y envía estado Zustand |

| Evento consumido | Exchange | Acción |
|-----------------|----------|--------|
| `GameCompleted` | `idct.gaming.games.game.completed` | Evalúa si incrementar streak (una vez por día) |

---

## 📦 Content

**Responsabilidad**: Gestionar el catálogo de flashcards y el pipeline de generación de audio.

```mermaid
graph LR
    subgraph Content ["📦 Content"]
        Flashcard["Flashcard\n(Aggregate Root)"]
        Example["Example\n(Entity)"]
        Flashcard --- Example
    end

    subgraph Emits ["Eventos que emite"]
        E1["FlashcardCreated\nidct.content.flashcard.created"]
        E2["FlashcardUpdated\nidct.content.flashcard.updated"]
    end

    subgraph Internal ["Handlers internos"]
        H1["AudioGenerationHandler\n(ElevenLabs × 4 archivos)"]
    end

    Content -->|emite| E1
    Content -->|emite| E2
    E1 -->|consume interno| H1
    E2 -->|consume interno — si cambió expression/examples| H1
```

| Evento emitido | Exchange | Trigger |
|----------------|----------|---------|
| `FlashcardCreated` | `idct.content.flashcard.created` | Teacher publica nueva flashcard (manual, bulk JSON o PDF) |
| `FlashcardUpdated` | `idct.content.flashcard.updated` | Teacher edita una flashcard existente |

| Evento consumido | Exchange | Acción |
|-----------------|----------|--------|
| `FlashcardCreated` | `idct.content.flashcard.created` | AudioGenerationHandler → ElevenLabs → CDN → `audio_status: ready` |
| `FlashcardUpdated` | `idct.content.flashcard.updated` | AudioGenerationHandler (solo si cambió `expression` o `examples`) |

---

## 🎮 Gaming

**Responsabilidad**: Gestionar el ciclo de vida de los juegos y registrar los intentos del usuario.

```mermaid
graph LR
    subgraph Gaming ["🎮 Gaming"]
        Game["Game\n(Aggregate Root)"]
        Attempt["Attempt\n(Entity)"]
        Game --- Attempt
    end

    subgraph Emits ["Eventos que emite"]
        E1["AttemptRecorded\nidct.gaming.attempts.attempt.recorded"]
        E2["GameCompleted\nidct.gaming.games.game.completed"]
        E3["GamePaused\n(interno — sin cola)"]
        E4["GameAbandoned\n(interno — sin cola)"]
    end

    Gaming -->|emite| E1
    Gaming -->|emite| E2
    Gaming -->|emite| E3
    Gaming -->|emite| E4
```

| Evento emitido | Exchange | Trigger |
|----------------|----------|---------|
| `AttemptRecorded` | `idct.gaming.attempts.attempt.recorded` | Usuario responde una flashcard (✓ o ✗) — inmediato |
| `GameCompleted` | `idct.gaming.games.game.completed` | Usuario termina todas las flashcards del game |
| `GamePaused` | — interno | Usuario sale de la pantalla / inactividad > 15 min / acción explícita |
| `GameAbandoned` | — interno | Usuario elige abandonar explícitamente / FIFO al superar 5 pausados |

> `GamePaused` y `GameAbandoned` son eventos de dominio internos — no se publican al bus ya que ningún otro BC los consume.

---

## 📈 Progress

**Responsabilidad**: Materializar y mantener el progreso del usuario por flashcard y por módulo.

```mermaid
graph LR
    subgraph Consumes ["Eventos que consume"]
        C1["AttemptRecorded\nidct.gaming.attempts.attempt.recorded"]
        C2["GameCompleted\nidct.gaming.games.game.completed"]
        C3["GuestProgressMigrated\nidct.identity.users.guest_progress.migrated"]
        C4["PronunciationEvaluated\nidct.pronunciation.attempt.evaluated"]
    end

    subgraph Progress ["📈 Progress"]
        UFS["UserFlashcardStats\n(Aggregate Root)"]
        MP["ModuleProgress\n(Read Model)"]
        UFS --- MP
    end

    subgraph Emits ["Eventos que emite"]
        E1["ModuleLevelUp\nidct.progress.module_progress.module_level.up"]
    end

    C1 -->|consume| Progress
    C2 -->|consume| Progress
    C3 -->|consume| Progress
    C4 -->|consume| Progress
    Progress -->|emite| E1
```

| Evento consumido | Exchange | Acción |
|-----------------|----------|--------|
| `AttemptRecorded` | `idct.gaming.attempts.attempt.recorded` | UPSERT `user_flashcard_stats` — actualiza `times_played`, `correct_count`, `accuracy_rate` |
| `GameCompleted` | `idct.gaming.games.game.completed` | Recalcula `ModuleProgress` (study/mastery/combined level) |
| `GuestProgressMigrated` | `idct.identity.users.guest_progress.migrated` | Bulk UPSERT `user_flashcard_stats` desde historial guest |
| `PronunciationEvaluated` | `idct.pronunciation.attempt.evaluated` | Actualiza pronunciation stats en `user_flashcard_stats` |

| Evento emitido | Exchange | Trigger |
|----------------|----------|---------|
| `ModuleLevelUp` | `idct.progress.module_progress.module_level.up` | Recálculo de `ModuleProgress` detecta subida de nivel |

---

## 🎤 Pronunciation

**Responsabilidad**: Evaluar la pronunciación del usuario y emitir el resultado.

```mermaid
graph LR
    subgraph Pronunciation ["🎤 Pronunciation"]
        PA["PronunciationAttempt\n(Entity)"]
    end

    subgraph Emits ["Eventos que emite"]
        E1["PronunciationEvaluated\nidct.pronunciation.attempt.evaluated"]
    end

    subgraph External ["Externo"]
        AZ["Azure Speech Service"]
    end

    Pronunciation -->|llama| AZ
    AZ -->|devuelve score + phonemes| Pronunciation
    Pronunciation -->|emite| E1
```

| Evento emitido | Exchange | Trigger |
|----------------|----------|---------|
| `PronunciationEvaluated` | `idct.pronunciation.attempt.evaluated` | Azure devuelve resultado → se persiste `PronunciationAttempt` |

---

## 🏆 Ranking

**Responsabilidad**: Mantener rankings materializados para lectura eficiente.

```mermaid
graph LR
    subgraph Consumes ["Eventos que consume"]
        C1["ModuleLevelUp\nidct.progress.module_progress.module_level.up"]
    end

    subgraph Ranking ["🏆 Ranking"]
        RC["RankingCache\n(Read Model)"]
    end

    subgraph Job ["Scheduled Job"]
        J1["RankingRecomputeJob\n(periódico)"]
    end

    C1 -->|marca dirty| Ranking
    J1 -->|recomputa| RC
```

| Evento consumido | Exchange | Acción |
|-----------------|----------|--------|
| `ModuleLevelUp` | `idct.progress.module_progress.module_level.up` | Marca ranking como `dirty` → recomputado en próximo job |

**No emite eventos.** Es un pure read model — solo responde a queries.

Fuentes de datos para el cálculo:
- `user_flashcard_stats` → accuracy, flashcards acertadas, module level
- `games` → partidas jugadas
- `users` → streak actual

---

## 🔔 Notification

**Responsabilidad**: Enviar notificaciones al usuario por los canales disponibles (toast, push, email).

```mermaid
graph LR
    subgraph Consumes ["Eventos que consume"]
        C1["UserRegistered\nidct.identity.users.user.registered"]
        C2["StreakUpdated\nidct.identity.streaks.streak.updated"]
        C3["StreakBroken\nidct.identity.streaks.streak.broken"]
        C4["ModuleLevelUp\nidct.progress.module_progress.module_level.up"]
    end

    subgraph Notification ["🔔 Notification"]
        EJ["EmailJob\n(Resend)"]
        PJ["PushJob\n(VAPID)"]
        TJ["ToastEvent\n(frontend)"]
    end

    C1 -->|consume| EJ
    C2 -->|consume — si hito 7/30/100 días| TJ
    C2 -->|consume — si hito 7/30/100 días| PJ
    C3 -->|consume| EJ
    C3 -->|consume| PJ
    C4 -->|consume| TJ
```

| Evento consumido | Exchange | Canal | Condición |
|-----------------|----------|-------|-----------|
| `UserRegistered` | `idct.identity.users.user.registered` | Email (Resend) | Siempre |
| `StreakUpdated` | `idct.identity.streaks.streak.updated` | Toast + Push | Solo si hito (7, 30, 100 días) |
| `StreakBroken` | `idct.identity.streaks.streak.broken` | Email + Push | Siempre que streak > 0 |
| `ModuleLevelUp` | `idct.progress.module_progress.module_level.up` | Toast | Siempre |

**No emite eventos.** Es un pure consumer — solo ejecuta side effects.
