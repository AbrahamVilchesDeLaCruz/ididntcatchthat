# Data Model

```mermaid
erDiagram
    USER {
        uuid id PK
        string email
        string username
        string password_hash
        enum role "student | admin"
        int xp
        int streak_days
        date last_played_at
        timestamp created_at
    }

    DECK {
        uuid id PK
        string title
        string description
        enum level "A1 | A2 | B1 | B2 | C1 | C2"
        enum category "connected_speech | phrasal_verbs | idioms | pronunciation"
        boolean is_published
        uuid created_by FK
        timestamp created_at
    }

    FLASHCARD {
        uuid id PK
        uuid deck_id FK
        string expression
        string phonetic_transcription
        string meaning_en
        string meaning_es
        string example_sentence
        string audio_url_us
        string audio_url_uk
        string audio_url_au
        enum audio_status "pending | generating | ready | error"
        timestamp created_at
    }

    USER_FLASHCARD_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid flashcard_id FK
        int repetitions
        float easiness_factor
        int interval_days
        date next_review_at
        timestamp last_reviewed_at
    }

    SESSION {
        uuid id PK
        uuid user_id FK
        uuid deck_id FK
        int total_cards
        int correct_answers
        int xp_earned
        int duration_seconds
        timestamp started_at
        timestamp finished_at
    }

    SESSION_ANSWER {
        uuid id PK
        uuid session_id FK
        uuid flashcard_id FK
        boolean is_correct
        int response_time_ms
        timestamp answered_at
    }

    PRONUNCIATION_SCORE {
        uuid id PK
        uuid user_id FK
        uuid flashcard_id FK
        uuid session_id FK
        float score_overall
        float score_accuracy
        float score_fluency
        float score_completeness
        jsonb phoneme_scores
        timestamp evaluated_at
    }

    USER ||--o{ DECK : "creates (admin)"
    DECK ||--o{ FLASHCARD : "contains"
    USER ||--o{ USER_FLASHCARD_PROGRESS : "tracks"
    FLASHCARD ||--o{ USER_FLASHCARD_PROGRESS : "tracked by"
    USER ||--o{ SESSION : "plays"
    DECK ||--o{ SESSION : "played in"
    SESSION ||--o{ SESSION_ANSWER : "has"
    FLASHCARD ||--o{ SESSION_ANSWER : "answered in"
    USER ||--o{ PRONUNCIATION_SCORE : "earns"
    FLASHCARD ||--o{ PRONUNCIATION_SCORE : "evaluated in"
    SESSION ||--o{ PRONUNCIATION_SCORE : "contains"
```

## Notas

- `USER_FLASHCARD_PROGRESS` implementa el algoritmo SM-2 de spaced repetition (`easiness_factor`, `interval_days`, `next_review_at`)
- `phoneme_scores` es `jsonb` — la estructura que devuelve Azure Speech varía por palabra, no vale la pena normalizar
- `audio_status` en `FLASHCARD` refleja el estado del pipeline de ElevenLabs (ver diagrama de audio pipeline)
- `SESSION_ANSWER` guarda `response_time_ms` para métricas de dificultad percibida por flashcard
- `role` en `USER` determina acceso al backoffice de admin
