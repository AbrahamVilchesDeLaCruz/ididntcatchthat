# Game Flashcards — Casos de Uso

```mermaid
---
title: Game Flashcards — Casos de uso
---
graph TB
    Guest(["👤 Guest"])
    User(["🧑 Usuario Registrado"])

    UC1["Ver flashcards de la partida activa"]
    UC2["Saber cuáles faltan por jugar/estudiar"]
    UC3["Ver error: partida ajena"]

    Guest --> UC1
    User --> UC1
    UC1 --> UC2
    UC1 -.->|"<<extend>>"| UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT o guest token |
| Modos | Funciona en `game` y `study` |
| Envelope | `{ data: GameFlashcardDto[] }` |
| Cliente | Usado en UI de partida para progreso por carta |
