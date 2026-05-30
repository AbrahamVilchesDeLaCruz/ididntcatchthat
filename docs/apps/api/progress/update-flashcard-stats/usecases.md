# Update Flashcard Stats — Casos de Uso

```mermaid
---
title: Update Flashcard Stats — Casos de uso
---
graph TB
    AMQP(["⚡ AttemptRecorded\n(RabbitMQ)"])

    UC1["Crear stats de flashcard (primera vez)"]
    UC2["Actualizar stats modo estudio"]
    UC3["Actualizar stats modo juego + recalcular accuracy"]
    UC4["Ignorar intento de guest"]

    AMQP --> UC1
    AMQP --> UC2
    AMQP --> UC3
    AMQP --> UC4

    note1["userId === null\nack sin procesar"]
    note2["mode = 'study'\nrecordStudy(correct)"]
    note3["mode = 'game'\nrecordPlay(correct)\naccuracyRate = correctCount / timesPlayed"]

    UC4 -.- note1
    UC2 -.- note2
    UC3 -.- note3
```

## Reglas de negocio

| Regla | Acción |
|---|---|
| Si `userId === null`, el evento se ignora (guest) | `ack` sin procesar — los guests importan su progreso al registrarse |
| Si el registro no existe, se crea con contadores en 0 | `UserFlashcardStats.create()` → `recordStudy/Play()` → `save()` |
| `timesStudied` y `correctCount (study)` se actualizan con `mode = 'study'` | `recordStudy(correct)` |
| `timesPlayed`, `correctCount` y `accuracyRate` se actualizan con `mode = 'game'` | `recordPlay(correct)` |
| `accuracyRate = correctCount / timesPlayed` — solo intentos en modo `game` | Calculado en `recordPlay()`, nunca en `recordStudy()` |
