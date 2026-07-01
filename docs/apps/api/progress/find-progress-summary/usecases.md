# Find Progress Summary — Casos de Uso

```mermaid
---
title: Progress Summary — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Ver resumen de progreso personal"]
    UC2["Ver streak y partidas completadas"]
    UC3["Ver contadores de débiles y dominadas"]

    User --> UC1
    UC1 --> UC2
    UC1 --> UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT obligatorio — 401 sin token |
| Agregación | Read model SQL en `TypeOrmProgressSummaryQuery` |
| Streak | Lee `users.current_streak` / `longest_streak` (Identity) |
| Games | Cuenta `games` completadas del usuario (Gaming) |
| Envelope | `{ data: ProgressSummary }` |

## ProgressSummary

| Campo | Tipo |
|-------|------|
| `currentStreak` | number |
| `longestStreak` | number |
| `accuracy7d` | number (0–1) |
| `totalAttempts` | number |
| `weakCount` | number |
| `masteredCount` | number |
| `gamesCompleted` | number |
| `lastPlayedAt` | ISO8601 \| null |
