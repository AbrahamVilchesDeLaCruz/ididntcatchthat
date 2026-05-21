# ADR 019 — Event Bus: RabbitMQ, Retry, DLQ e Idempotencia

**Estado**: Aceptado  
**Fecha**: 2026-05-21  
**Autores**: Abraham Vilches de la Cruz

---

## Contexto

La plataforma necesita comunicación asíncrona entre bounded contexts. Cuando ocurre un evento de dominio (ej: `flashcard.created`), otros módulos deben reaccionar sin acoplarse directamente al emisor.

Requisitos:

- Desacoplamiento entre módulos — el emisor no conoce a los consumidores
- Resiliencia ante fallos — si un subscriber falla, el mensaje no se pierde
- Procesamiento seguro — un evento no debe procesarse dos veces con efectos duplicados
- Operacional — poder recuperar mensajes fallidos manualmente tras un fix

---

## Decisión

**RabbitMQ como broker de eventos con patrón Inbox para idempotencia híbrida.**

---

## Arquitectura de capas

```
Domain
  └── DomainEvent (base)
  └── EventBus interface              → publish(events[])

Application
  └── DomainEventConsumer interface   → consume(queue, exchange, event, handler)
  └── Handler (abstract)              → init() — puro, sin imports de NestJS

Infrastructure
  └── AmqpMessageBus                  → implements EventBus + DomainEventConsumer
      ├── setupQueues()               → crea main + .retry + .dead_letter automático
      ├── consume()                   → llamado desde Handler.init()
      └── publish()                   → llamado desde UseCase vía EventBus
  └── HandlersBootstrapper            → implements OnModuleInit → llama handler.init()
```

**Regla clave:** `OnModuleInit` es NestJS — vive exclusivamente en infrastructure. `Handler` en application es una clase abstracta pura sin ningún import de framework. El bootstrapping lo delega `HandlersBootstrapper` llamando a `handler.init()` en `onModuleInit()`.

## Flujo de mensajes

```
UseCase
  → eventBus.publish(aggregate.pullDomainEvents())
    → AmqpMessageBus.publish() → RabbitMQ exchange
      → cola del handler
        → HandlersBootstrapper.onModuleInit() → handler.init()
          → AmqpMessageBus.consume() → setupQueues() automático
            → handler.handle(event) → UseCase correspondiente
```

## Colas — auto-setup

Cada handler registra sus colas automáticamente al arrancar vía `setupQueues()`:

```
<queueName>               ← cola principal (durable)
<queueName>.retry         ← reintentos con TTL dinámico por mensaje
<queueName>.dead_letter   ← mensajes agotados — intervención manual
```

### Naming de colas

```
# Cola principal
<acción>_on_<aggregate>_<evento_pasado>
create_flashcard_audio_on_flashcard_created

# Derivadas — creadas automáticamente
create_flashcard_audio_on_flashcard_created.retry
create_flashcard_audio_on_flashcard_created.dead_letter
```

---

## Retry Policy

| Intento | Delay | Mecanismo |
|---|---|---|
| 1 | 1s | `expiration: "1000"` en mensaje → `.retry` → vuelve a cola principal |
| 2 | 5s | `expiration: "5000"` en mensaje → `.retry` → vuelve a cola principal |
| 3 | 10s | `expiration: "10000"` en mensaje → `.retry` → vuelve a cola principal |
| 4 | — | → `.dead_letter` — no más reintentos automáticos |

**El TTL es por mensaje** (`expiration` en publish options), no por cola — permite backoff exponencial real con una sola `.retry` queue. La `.retry` queue tiene `x-dead-letter-routing-key` apuntando de vuelta a la cola principal.

---

## Dead Letter Queue (DLQ)

Cuando un mensaje agota los reintentos va a la DLQ. **No se pierde — espera intervención manual.**

### Flujo de recuperación

```
1. Se detecta el fallo (alerta en Grafana o log de error)
2. Se identifica y corrige el bug
3. Se hace deploy del fix
4. Se re-encolan los mensajes de la DLQ manualmente:

   # Re-encolar todos los mensajes de una DLQ a su cola principal
   rabbitmqadmin move messages \
     --source-queue=create_flashcard_audio_on_flashcard_created.dlq \
     --destination-queue=create_flashcard_audio_on_flashcard_created

5. Los mensajes se procesan normalmente con el fix aplicado
```

Los mensajes en DLQ incluyen metadata del error original (headers de RabbitMQ) para diagnóstico.

---

## Idempotencia — Patrón Inbox Híbrido

RabbitMQ garantiza **at-least-once delivery** — el mismo mensaje puede llegar más de una vez ante fallos de red o reinicios. Los handlers deben ser idempotentes.

### Estrategia por tipo de operación

#### Opción A — Idempotencia natural (mayoría de casos)

Para operaciones donde el estado final es verificable antes de actuar:

```typescript
async on(event: FlashcardCreatedEvent): Promise<void> {
  const existing = await this.audioRepo.search(new FlashcardId(event.flashcardId));
  if (existing) return; // ya procesado — salida limpia sin error

  await this.useCase.execute({ flashcardId: event.flashcardId });
}
```

Aplica a: generación de audio, envío de emails, creación de recursos derivados.

#### Opción B — Inbox table (operaciones críticas)

Para operaciones donde el efecto no es fácilmente verificable o es irreversible:

```typescript
// src/shared/infrastructure/persistence/inbox/processed-event.typeorm-entity.ts
@Entity("processed_events")
export class ProcessedEventTypeOrmEntity {
  @PrimaryColumn("uuid")
  event_id: string;

  @Column()
  event_name: string;

  @CreateDateColumn()
  processed_at: Date;
}
```

```typescript
async on(event: CriticalDomainEvent): Promise<void> {
  const alreadyProcessed = await this.inboxRepo.exists(event.eventId);
  if (alreadyProcessed) return;

  await this.useCase.execute({ ... });

  await this.inboxRepo.save(event.eventId, event.eventName);
}
```

```sql
-- Limpieza periódica — eventos procesados hace más de 30 días
DELETE FROM processed_events WHERE processed_at < NOW() - INTERVAL '30 days';
```

Aplica a: operaciones de pago, integraciones externas sin idempotency key, modificaciones irreversibles.

### Decisión por handler

| Handler                                       | Estrategia | Razón                                       |
| --------------------------------------------- | ---------- | ------------------------------------------- |
| `create_flashcard_audio_on_flashcard_created` | Opción A   | Audio es verificable (existe o no)          |
| `send_welcome_email_on_user_registered`       | Opción A   | Email service tiene idempotency key propio  |
| Futuros handlers de pago                      | Opción B   | Irreversible, sin estado verificable previo |

---

## Configuración RabbitMQ

```typescript
// src/shared/infrastructure/event-bus/rabbitmq.config.ts
export const rabbitmqConfig = {
  exchanges: [
    {
      name: "ididntcatchthat.flashcards.flashcard.created",
      type: "topic",
      options: { durable: true },
    },
  ],
  queues: [
    {
      name: "create_flashcard_audio_on_flashcard_created",
      options: {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": "create_flashcard_audio_on_flashcard_created.dlq",
        },
      },
    },
    {
      name: "create_flashcard_audio_on_flashcard_created.dlq",
      options: { durable: true },
    },
  ],
};
```

---

## Alternativas consideradas

### Redis Streams / BullMQ

**Rechazado** — BullMQ es excelente para jobs/queues dentro de un mismo servicio, pero no está diseñado para event-driven entre bounded contexts. RabbitMQ tiene mejor soporte para routing, exchanges y DLQ nativa.

### Kafka

**Rechazado** — Kafka es la solución correcta a escala (millones de eventos/día, replay de eventos, múltiples consumers independientes). Para un TFM con tráfico moderado, el overhead operacional (ZooKeeper/KRaft, particiones, consumer groups) no está justificado. Migrar de RabbitMQ a Kafka en el futuro es viable si la interfaz `EventBus` está bien abstraída.

### Eventos síncronos (in-process)

**Rechazado** — acopla los módulos, no sobrevive a reinicios del proceso, no escala horizontalmente.

---

## Consecuencias

**Positivas:**

- Desacoplamiento real entre bounded contexts — el emisor no conoce consumidores
- Resiliencia: 3 reintentos con backoff antes de DLQ — cubre fallos transitorios
- Sin pérdida de mensajes — DLQ retiene todo para recuperación manual
- Idempotencia híbrida — simple donde es posible, fuerte donde es necesario
- Migración futura a Kafka viable sin cambiar código de dominio ni aplicación

**Negativas / trade-offs:**

- Infraestructura adicional: RabbitMQ en Docker Compose
- La tabla `processed_events` necesita limpieza periódica
- Re-encolar DLQ es manual — requiere acceso operacional al broker
- At-least-once delivery requiere disciplina en cada handler nuevo

---

## Referencias

- Skill de implementación: [skills/api-events/SKILL.md](../../skills/api-events/SKILL.md)
- [RabbitMQ Dead Letter Exchanges](https://www.rabbitmq.com/dlx.html)
- [Enterprise Integration Patterns — Idempotent Receiver](https://www.enterpriseintegrationpatterns.com/IdempotentReceiver.html)
