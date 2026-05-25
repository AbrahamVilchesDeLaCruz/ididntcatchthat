# Complete Game — Casos de Uso

```mermaid
---
title: Complete Game — Casos de uso
---
graph TB
    Guest(["👤 Guest"])
    User(["🧑 Usuario Registrado"])

    UC1["Completar partida"]
    E1["Ver error: attempts pendientes"]
    E2["Ver error: game no encontrado"]
    E3["Ver error: game no es del usuario"]

    Guest --> UC1
    User --> UC1
    UC1 -.->|"<<extend>>"| E1
    UC1 -.->|"<<extend>>"| E2
    UC1 -.->|"<<extend>>"| E3
```

## Reglas de negocio

| Regla | Acción |
|---|---|
| Todas las flashcards deben tener attempt registrado | `GameNotFinished` (422) |
| Game debe pertenecer al usuario | `GameAccessDenied` (403) |
| Se emite `GameCompletedEvent` | BC Progress recalcula `ModuleProgress`; BC Identity evalúa streak |
| Retorna resumen: correctas, total, accuracy, duración | Calculado en memoria desde `game.attempts` |
