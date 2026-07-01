# Search Analytics Summary — Casos de Uso

```mermaid
---
title: Analytics Summary — Casos de uso
---
graph TB
    Admin(["👤 Admin"])

    UC1["Ver resumen histórico de métricas de negocio"]
    UC2["Filtrar por periodo temporal"]
    UC3["Ver error: no autorizado"]

    Admin --> UC1
    UC1 --> UC2
    Admin -.->|"<<extend>>"| UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT admin |
| Datos | Page views + contadores cross-BC (games, users, flashcards) |
| Histórico | Persistido en DB — sobrevive reinicios (vs Prometheus) |
| Envelope | `{ data: AnalyticsSummary, meta }` |
| Cliente | Tab Visitas/Contenido en backoffice observability |

## vs Observability

| | Analytics summary | Metrics summary |
|--|-------------------|-----------------|
| Fuente | PostgreSQL | Prometheus registry |
| Histórico | Sí | Desde arranque del proceso |
| Page views | Sí | No |
