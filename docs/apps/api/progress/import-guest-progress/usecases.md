# Import Guest Progress — Casos de Uso

```mermaid
---
title: Import Guest Progress — Casos de uso
---
graph TB
    AMQP(["⚡ GuestProgressMigrated\n(RabbitMQ)"])

    UC1["Importar historial de intentos del guest"]
    UC2["Ignorar evento duplicado (idempotencia)"]
    UC3["Crear stats nuevas para flashcards nunca vistas"]
    UC4["Acumular stats en flashcards ya vistas"]

    AMQP --> UC1
    AMQP --> UC2
    UC1 -.->|"<<include>>"| UC3
    UC1 -.->|"<<include>>"| UC4

    note1["Inbox pattern\nprocessed_events table"]
    note2["UserFlashcardStats.create()\n+ recordPlay(correct)"]
    note3["UserFlashcardStats.fromPrimitives()\n+ recordPlay(correct)"]

    UC2 -.- note1
    UC3 -.- note2
    UC4 -.- note3
```

## Reglas de negocio

| Regla | Acción |
|---|---|
| **Idempotencia** — si el `eventId` ya fue procesado, se ignora | Inbox pattern via tabla `processed_events` |
| Los intentos del guest se leen de la tabla `attempts` JOIN `games` de Gaming | Raw SQL cross-BC — solo lectura, no acopla BCs |
| `TypeOrmGuestAttemptRepository` hardcodea `mode: 'game'` para todos los intentos guest | Los guests solo pueden jugar en modo `game` (no study) |
| Por cada intento: busca o crea `UserFlashcardStats` y llama `recordPlay(correct)` | Mismo flujo que `UpdateFlashcardStats`, pero en bulk |
| Al final del procesamiento, guarda el `eventId` en `processed_events` | Garantiza que si el mensaje se reintenta, no se duplican stats |
| **No** recalcula `ModuleProgress` — eso ocurre solo vía `GameCompleted` | Separación de responsabilidades — cada subscriber hace una cosa |
