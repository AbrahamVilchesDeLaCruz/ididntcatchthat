# Admin Game Stats — Casos de Uso

```mermaid
---
title: Admin Game Stats — Casos de uso
---
graph TB
    Admin(["👤 Admin / Teacher"])

    UC1["Ver métricas agregadas de partidas por periodo"]
    UC2["Ver error: no autorizado"]
    UC3["Ver error: period inválido"]

    Admin --> UC1
    Admin -.->|"<<extend>>"| UC2
    Admin -.->|"<<extend>>"| UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT + rol `admin` |
| Period | Enum en `SearchGamesStatsGetQuery` |
| Datos | Partidas iniciadas/completadas, modos, accuracy agregada |
| Envelope | `{ data: GameStatsSummary, meta }` |
| Uso | Backoffice observability |
