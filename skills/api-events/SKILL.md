---
name: api-events
description: "EventBus interface, DomainEventConsumer, Subscriber abstract en apps/api/. Trigger: Al definir el EventBus, crear un Subscriber concreto en application, o entender el flujo de domain events."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al definir el `EventBus` interface o `DomainEventConsumer` interface
- Al crear un `Subscriber` concreto en application
- Al entender el flujo de eventos y la regla de dependencia

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/subscriber-pattern.md` para la clase `Subscriber` abstract completa, un ejemplo de subscriber concreto, `SubscribersBootstrapper` y el registro en módulos NestJS.

---

## Capas y responsabilidades

```
Domain         → DomainEvent, EventBus interface
Application    → Subscriber (abstract), DomainEventConsumer interface
Infrastructure → AmqpMessageBus, SubscribersBootstrapper, módulos NestJS
```

---

## Flujo completo

```
UseCase
  → eventBus.publish(aggregate.pullDomainEvents())
    → AmqpMessageBus.publish() → RabbitMQ exchange
      → cola del subscriber
        → SubscribersBootstrapper.onModuleInit() → subscriber.init()
          → AmqpMessageBus.consume() → setupQueues() automático
            → subscriber.on(event) → UseCase correspondiente
```

---

## Domain — `EventBus` interface

```typescript
// src/shared/domain/event-bus.ts
export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
}

export const EVENT_BUS = Symbol('EventBus');
```

## Application — `DomainEventConsumer` interface

```typescript
// src/shared/application/domain-event-consumer.ts
export interface DomainEventConsumer {
  consume(
    queueName: string,
    eventName: string,
    exchangeName: string,
    domainEvent: new (...args: never) => DomainEvent,
    on: (event: DomainEvent) => Promise<void>,
  ): Promise<void>;
}

export const DOMAIN_EVENT_CONSUMER = Symbol('DomainEventConsumer');
```

---

## Queue Naming

```
<bounded-context>.<acción>_on_<evento_pasado>

progress.update_flashcard_stats_on_attempt_recorded
content.generate_flashcard_audio_on_flashcard_examples_completed
identity.send_welcome_email_on_user_registered
```

Las colas `.retry` y `.dead_letter` se crean automáticamente — ver `api-events-infra`.

---

## Reglas

- `Subscriber` abstract — **cero imports de `@nestjs/common`**
- `@Inject` + `@Injectable` en el subscriber concreto son la única excepción permitida
- `OnModuleInit` vive en infrastructure (`SubscribersBootstrapper`) — nunca en application
- `on()` **siempre delega a un UseCase** — sin lógica de negocio propia
- El subscriber vive **junto al use case que dispara** — nunca en carpeta `subscribers/` independiente
- `eventBus.publish()` se llama **después** de `repository.save()` — nunca antes
- Ver implementación de infrastructure: skill `api-events-infra`
