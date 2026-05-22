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
        E1["UserRegistered"]
        E2["StreakUpdated"]
        E3["StreakBroken"]
        E4["GuestProgressMigrated"]
    end

    subgraph Consumes ["Eventos que consume"]
        C1["GameCompleted\n(desde Gaming)"]
    end

    Identity -->|emite| E1
    Identity -->|emite| E2
    Identity -->|emite| E3
    Identity -->|emite| E4
    C1 -->|consume| Identity
```

| Evento emitido          | Trigger                                               |
| ----------------------- | ----------------------------------------------------- |
| `UserRegistered`        | Usuario completa registro (email o OAuth)             |
| `StreakUpdated`         | `GameCompleted` o sesión de estudio — primera del día |
| `StreakBroken`          | Job nocturno detecta que `last_activity_date < ayer`  |
| `GuestProgressMigrated` | Guest completa registro y envía estado Zustand        |

| Evento consumido | Acción                                         |
| ---------------- | ---------------------------------------------- |
| `GameCompleted`  | Evalúa si incrementar streak (una vez por día) |

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
        E1["FlashcardCreated"]
        E2["FlashcardUpdated"]
    end

    subgraph Internal ["Handlers internos"]
        H1["AudioGenerationHandler\n(ElevenLabs × 4 archivos)"]
    end

    Content -->|emite| E1
    Content -->|emite| E2
    E1 -->|consume interno| H1
    E2 -->|consume interno — si cambió expression/examples| H1
```

| Evento emitido     | Trigger                                                   |
| ------------------ | --------------------------------------------------------- |
| `FlashcardCreated` | Teacher publica nueva flashcard (manual, bulk JSON o PDF) |
| `FlashcardUpdated` | Teacher edita una flashcard existente                     |

| Evento consumido   | Acción                                                            |
| ------------------ | ----------------------------------------------------------------- |
| `FlashcardCreated` | AudioGenerationHandler → ElevenLabs → CDN → `audio_status: ready` |
| `FlashcardUpdated` | AudioGenerationHandler (solo si cambió `expression` o `examples`) |

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
        E1["AttemptRecorded"]
        E2["GameCompleted"]
        E3["GamePaused"]
        E4["GameAbandoned"]
    end

    Gaming -->|emite| E1
    Gaming -->|emite| E2
    Gaming -->|emite| E3
    Gaming -->|emite| E4
```

| Evento emitido    | Trigger                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `AttemptRecorded` | Usuario responde una flashcard (✓ o ✗) — inmediato                    |
| `GameCompleted`   | Usuario termina todas las flashcards del game                         |
| `GamePaused`      | Usuario sale de la pantalla / inactividad > 15 min / acción explícita |
| `GameAbandoned`   | Usuario elige abandonar explícitamente / FIFO al superar 5 pausados   |

---

## 📈 Progress

**Responsabilidad**: Materializar y mantener el progreso del usuario por flashcard y por módulo.

```mermaid
graph LR
    subgraph Consumes ["Eventos que consume"]
        C1["AttemptRecorded\n(desde Gaming)"]
        C2["GameCompleted\n(desde Gaming)"]
        C3["GuestProgressMigrated\n(desde Identity)"]
        C4["PronunciationEvaluated\n(desde Pronunciation)"]
    end

    subgraph Progress ["📈 Progress"]
        UFS["UserFlashcardStats\n(Aggregate Root)"]
        MP["ModuleProgress\n(Read Model)"]
        UFS --- MP
    end

    subgraph Emits ["Eventos que emite"]
        E1["ModuleLevelUp"]
    end

    C1 -->|consume| Progress
    C2 -->|consume| Progress
    C3 -->|consume| Progress
    C4 -->|consume| Progress
    Progress -->|emite| E1
```

| Evento consumido         | Acción                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `AttemptRecorded`        | UPSERT `user_flashcard_stats` — actualiza `times_played`, `correct_count`, `accuracy_rate` |
| `GameCompleted`          | Recalcula `ModuleProgress` (study/mastery/combined level)                                  |
| `GuestProgressMigrated`  | Bulk UPSERT `user_flashcard_stats` desde historial guest                                   |
| `PronunciationEvaluated` | Actualiza pronunciation stats en `user_flashcard_stats`                                    |

| Evento emitido  | Trigger                                               |
| --------------- | ----------------------------------------------------- |
| `ModuleLevelUp` | Recálculo de `ModuleProgress` detecta subida de nivel |

---

## 🎤 Pronunciation

**Responsabilidad**: Evaluar la pronunciación del usuario y emitir el resultado.

```mermaid
graph LR
    subgraph Pronunciation ["🎤 Pronunciation"]
        PA["PronunciationAttempt\n(Entity)"]
    end

    subgraph Emits ["Eventos que emite"]
        E1["PronunciationEvaluated"]
    end

    subgraph External ["Externo"]
        AZ["Azure Speech Service"]
    end

    Pronunciation -->|llama| AZ
    AZ -->|devuelve score + phonemes| Pronunciation
    Pronunciation -->|emite| E1
```

| Evento emitido           | Trigger                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `PronunciationEvaluated` | Azure devuelve resultado → se persiste `PronunciationAttempt` |

---

## 🏆 Ranking

**Responsabilidad**: Mantener rankings materializados para lectura eficiente.

```mermaid
graph LR
    subgraph Consumes ["Eventos que consume"]
        C1["ModuleLevelUp\n(desde Progress)"]
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

| Evento consumido | Acción                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| `ModuleLevelUp`  | Marca ranking correspondiente como `dirty` → será recomputado en el próximo job |

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
        C1["UserRegistered\n(desde Identity)"]
        C2["StreakUpdated\n(desde Identity)"]
        C3["StreakBroken\n(desde Identity)"]
        C4["ModuleLevelUp\n(desde Progress)"]
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

| Evento consumido | Canal          | Condición                      |
| ---------------- | -------------- | ------------------------------ |
| `UserRegistered` | Email (Resend) | Siempre                        |
| `StreakUpdated`  | Toast + Push   | Solo si hito (7, 30, 100 días) |
| `StreakBroken`   | Email + Push   | Siempre que streak > 0         |
| `ModuleLevelUp`  | Toast          | Siempre                        |

**No emite eventos.** Es un pure consumer — solo ejecuta side effects.
