# Pause Game — Casos de Uso

```mermaid
---
title: Pause Game — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])
    Guest(["👤 Guest"])

    UC1["Pausar partida"]
    UC2["Ver partidas pausadas"]
    E1["Ver error: no puede pausar (guest)"]
    E2["Ver error: game no en progreso"]

    User --> UC1
    User --> UC2
    Guest --> E1
    UC1 -.->|"<<extend>>"| E2
```

## Reglas de negocio

| Regla | Acción |
|---|---|
| Solo usuarios registrados pueden pausar | Guest → 403 (guard de rol en controller) |
| Game debe estar `in_progress` | `GameNotInProgress` (409) |
| Se persiste `lastFlashcardId` | Permite retomar desde la última carta |
| `GamePausedEvent` es INTERNO | No se publica al AMQP — ningún BC lo consume |
| Máximo 5 games pausados | Verificado al INICIAR, no al pausar |
