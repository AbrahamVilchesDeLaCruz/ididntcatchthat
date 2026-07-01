# User Stats — Casos de Uso

```mermaid
---
title: User Stats — Casos de uso
---
graph TB
    Admin(["👤 Admin / Teacher"])

    UC1["Ver métricas agregadas de usuarios por periodo"]
    UC2["Ver error: no autorizado"]
    UC3["Ver error: period inválido"]

    Admin --> UC1
    Admin -.->|"<<extend>>"| UC2
    Admin -.->|"<<extend>>"| UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT + rol `admin` (403 si no admin) |
| Period | Enum validado en `SearchUserStatsGetQuery` |
| Cross-BC | Actividad gaming vía `GamingUserActivityQuery` exportado por GamingModule |
| Envelope | `{ data: UserStatsSummary, meta }` |
| Uso | Backoffice / dashboards internos |
