# Abandon Game — Casos de Uso

```mermaid
---
title: Abandon Game — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Abandonar partida en progreso"]
    UC2["Abandonar partida pausada"]
    E1["Ver error: game ya finalizado"]
    E2["Ver error: game no encontrado"]

    User --> UC1
    User --> UC2
    UC1 -.->|"<<extend>>"| E1
    UC1 -.->|"<<extend>>"| E2
    UC2 -.->|"<<extend>>"| E1
    UC2 -.->|"<<extend>>"| E2
```

## Reglas de negocio

| Regla | Acción |
|---|---|
| Se puede abandonar desde `in_progress` o `paused` | Ambos estados son válidos |
| No se puede abandonar `completed` o `abandoned` | `GameAlreadyFinished` (409) |
| `GameAbandonedEvent` es INTERNO | No se publica al AMQP |
| Abandonar libera el slot de "juegos pausados" | Permite crear nuevos games si estaba en el límite de 5 |
| Solo usuarios registrados tienen este endpoint | Guest no puede pausar → tampoco tiene qué abandonar |
