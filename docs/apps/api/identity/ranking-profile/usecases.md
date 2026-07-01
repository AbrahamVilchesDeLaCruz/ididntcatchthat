# Ranking Profile — Casos de Uso

```mermaid
---
title: Ranking Profile — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Consultar preferencias de ranking"]
    UC2["Activar visibilidad en leaderboard"]
    UC3["Ocultarse del ranking"]
    UC4["Cambiar nickname público"]

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT obligatorio |
| GET | Devuelve `{ showInRanking, nickname }` del agregado User |
| PATCH | Al menos un campo opcional; validación con class-validator |
| Evento | Cambio publica `RankingProfileUpdated` → sync en Ranking BC |
| Opt-out | Ranking elimina filas existentes del usuario |
| Opt-in | Ranking renombra filas + backfill histórico |
| Envelope | Query responses usan `{ data, meta }` |
