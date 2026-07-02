---
name: api-events-infra
description: "AmqpMessageBus, SubscribersBootstrapper, retry, DLQ, idempotencia en apps/api/. Trigger: Al implementar AmqpMessageBus, configurar SubscribersBootstrapper, o entender retry y DLQ."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al implementar o modificar `AmqpMessageBus`
- Al registrar subscribers en módulos NestJS
- Al diseñar la política de retry o idempotencia

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/amqp-message-bus.md` para la implementación completa de `AmqpMessageBus`, `SubscribersBootstrapper` y el registro en módulos.

---

## Concepto

`AmqpMessageBus` implementa **dos interfaces** a la vez:

```
EventBus (domain)              → publish(events)
DomainEventConsumer (app)      → consume(queue, eventName, exchange, DomainEventClass, handler)
```

`SubscribersBootstrapper` llama a `subscriber.init()` en `onModuleInit()` — registra todos los consumers al arrancar.

---

## Retry Policy

| Intento | Delay | Mecanismo |
|---|---|---|
| 1 | 1 s | `expiration: "1000"` en `.retry` → vuelve vía DLX |
| 2 | 5 s | `expiration: "5000"` en `.retry` → vuelve vía DLX |
| 3 | 10 s | `expiration: "10000"` en `.retry` → vuelve vía DLX |
| 4 | — | → `.dead_letter` — intervención manual |

**El `expiration` es por mensaje, no por cola** — permite backoff exponencial con una sola `.retry` queue.

Colas creadas automáticamente en `setupQueues()`:
- `{queueName}` — cola principal
- `{queueName}.retry` — mensajes esperando reintento
- `{queueName}.dead_letter` — mensajes agotados

---

## Idempotencia

### Opción A — Natural (por defecto)

```typescript
async handle(event: DomainEvent): Promise<void> {
  const existing = await this.repo.search(id);
  if (existing) return; // ya procesado
  await this.useCase.execute({ ... });
}
```

### Opción B — Inbox table (operaciones irreversibles críticas)

```typescript
async handle(event: DomainEvent): Promise<void> {
  if (await this.inboxRepo.exists(event.eventId)) return;
  await this.useCase.execute({ ... });
  await this.inboxRepo.save(event.eventId, event.eventName());
}
```

Tabla: `processed_events(event_id UUID PK, event_name, processed_at)` — purgar > 30 días.

---

## Reglas

- `AmqpMessageBus` vive en `shared/infrastructure/` — es transversal a todos los BC
- `SubscribersBootstrapper` y el token `SUBSCRIBERS` se importan desde shared
- `OnModuleInit` solo en `SubscribersBootstrapper` — nunca en subscribers ni use cases
- El DLQ no se re-encola automáticamente — requiere fix manual + re-encolado explícito
- `prefetch(1)` siempre — procesamiento secuencial por consumer
- Usar `never` en `DomainEventClass: new (...args: never) => DomainEvent` — no `any`

> ADR de decisión: [docs/adr/019-event-bus-strategy.md](../../docs/adr/019-event-bus-strategy.md)
