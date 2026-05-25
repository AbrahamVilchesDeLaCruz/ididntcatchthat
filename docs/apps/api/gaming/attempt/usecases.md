# Attempt — Casos de Uso

```mermaid
---
title: Record Attempt — Casos de uso
---
graph TB
    Guest(["👤 Guest"])
    User(["🧑 Usuario Registrado"])

    UC1["Registrar respuesta correcta"]
    UC2["Registrar respuesta incorrecta"]
    E1["Ver error: game no encontrado"]
    E2["Ver error: game no es del usuario"]
    E3["Ver error: game no en progreso"]
    E4["Ver error: flashcard no pertenece al game"]

    Guest --> UC1
    Guest --> UC2
    User --> UC1
    User --> UC2

    UC1 -.->|"<<extend>>"| E1
    UC1 -.->|"<<extend>>"| E2
    UC1 -.->|"<<extend>>"| E3
    UC1 -.->|"<<extend>>"| E4
    UC2 -.->|"<<extend>>"| E1
    UC2 -.->|"<<extend>>"| E2
    UC2 -.->|"<<extend>>"| E3
    UC2 -.->|"<<extend>>"| E4
```

## Reglas de negocio

| Regla | Acción |
|---|---|
| Game debe existir | `GameNotFound` (404) |
| Game debe pertenecer al usuario que hace el request | `GameAccessDenied` (403) |
| Game debe estar en estado `in_progress` | `GameNotInProgress` (409) |
| `flashcardId` debe estar en las cartas del game | `FlashcardNotInGame` (422) |
| Cada attempt persiste en tiempo real (no al final) | INSERT inmediato en `attempts` |
| Se emite `AttemptRecordedEvent` por cada attempt | BC Progress lo consume para actualizar stats |
