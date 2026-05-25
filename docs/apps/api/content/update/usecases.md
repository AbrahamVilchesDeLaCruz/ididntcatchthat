# Update Flashcard — Casos de Uso

```mermaid
---
title: Update Flashcard — Casos de uso
---
graph TB
    Teacher(["👨‍🏫 Teacher"])
    Admin(["🛡️ Admin"])

    UC1["Editar flashcard propia"]
    UC2["Editar flashcard de otro teacher (solo admin)"]
    E1["Error: no encontrada"]
    E2["Error: no autorizado"]

    Teacher --> UC1
    Admin --> UC1
    Admin --> UC2
    UC1 -.->|"<<extend>>"| E1
    UC1 -.->|"<<extend>>"| E2
```

## Reglas de negocio

| Regla                                                                 | Acción                                                     |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Teacher solo puede editar sus propias flashcards                      | `FlashcardAccessDenied` (403) si `createdBy !== updatedBy` |
| Admin puede editar cualquier flashcard                                | Verificación de rol en use case                            |
| Cambio en `expression` o `examples` → regenerar audio                 | Se emite `FlashcardUpdatedEvent`                           |
| Cambio en `meaning`, `ipa`, `nativeSpeech` → sin audio                | NO se emite evento                                         |
| Si el audio estaba `ready` y se edita expression → vuelve a `pending` | `markAudioGenerating()` en el handler                      |
