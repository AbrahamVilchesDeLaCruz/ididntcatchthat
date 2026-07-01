# Game Summary — Casos de Uso

```mermaid
---
title: Game Summary — Casos de uso
---
graph TB
    Guest(["👤 Guest"])
    User(["🧑 Usuario Registrado"])

    UC1["Ver resumen de partida en curso o completada"]
    UC2["Ver error: partida no encontrada"]
    UC3["Ver error: partida ajena"]
    UC4["Ver error: partida sin terminar"]

    Guest --> UC1
    User --> UC1
    UC1 -.->|"<<extend>>"| UC2
    UC1 -.->|"<<extend>>"| UC3
    UC1 -.->|"<<extend>>"| UC4
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT o guest token |
| Ownership | `game.userId` debe coincidir con caller (null solo guest anónimo) |
| Pendientes | Si hay flashcards sin intento/vista → 422 `GameNotFinished` |
| Stats | `accuracy = correctCount / totalCount`; `duration` en segundos |
| Envelope | `{ data: GameSummaryResult, meta }` |
