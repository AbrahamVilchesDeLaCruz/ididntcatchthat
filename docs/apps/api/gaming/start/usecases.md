# Start Game — Casos de Uso

```mermaid
---
title: Start Game — Casos de uso
---
graph TB
    Guest(["👤 Guest"])
    User(["🧑 Usuario Registrado"])

    UC1["Iniciar partida (random)"]
    UC2["Iniciar partida (módulo específico)"]
    UC3["Ver error: límite de guest"]
    UC4["Ver error: máx. pausados"]

    Guest --> UC1
    Guest --> UC2
    Guest -.->|"<<extend>>"| UC3
    User --> UC1
    User --> UC2
    User -.->|"<<extend>>"| UC4

    note1["3 partidas max/día\n10 cartas max (guest)"]
    note2["5 pausados max\n(registrado)"]

    UC3 -.- note1
    UC4 -.- note2
```

## Reglas de negocio

| Regla | Actor | Acción |
|---|---|---|
| Máximo 3 partidas de 10 cartas por día | Guest | `GuestLimitExceeded` (429) |
| Máximo 5 games pausados simultáneos | User | `MaxPausedGamesReached` (409) con lista |
| `module: null` = selección aleatoria de todos los módulos | Todos | `FlashcardSelector.select(null, count)` |
| Solo flashcards con `audio_status: ready` se seleccionan | Sistema | Filtro en `TypeOrmFlashcardSelector` |
| La selección es aleatoria | Sistema | `ORDER BY RANDOM()` |
