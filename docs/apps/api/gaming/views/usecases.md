# Record View — Casos de uso

```mermaid
graph TB
    User(["🧑 Usuario Registrado"])
    UC1["Registrar vista de flashcard"]
    UC2["Ver error: no es sesión study"]
    UC3["Ver error: flashcard no pertenece"]

    User --> UC1
    User -.->|"<<extend>>"| UC2
    User -.->|"<<extend>>"| UC3
```

| Regla | Acción |
| ----- | ------ |
| Solo `mode = study` | `ViewRequiresStudyMode` |
| Flashcard ∈ game | `FlashcardNotInGame` |
| Game `in_progress` | `GameNotInProgress` |
| Emite evento | `FlashcardViewedEvent` → Progress |
