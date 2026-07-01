# List Paused Games — Casos de Uso

```mermaid
---
title: List Paused Games — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Listar partidas pausadas propias"]
    UC2["Retomar partida desde UI"]
    UC3["Ver lista vacía"]

    User --> UC1
    UC1 --> UC2
    UC1 --> UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT — guest no puede pausar ni listar |
| Query | `status=paused` requerido para este flujo |
| Orden | Por `startedAt` descendente (impl en repository) |
| Envelope | `{ data: GamePrimitives[] }` |
| Relacionado | Resume vía [resume/](./../resume/) |
