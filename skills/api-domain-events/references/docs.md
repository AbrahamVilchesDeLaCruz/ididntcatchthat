# api-domain-events — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain` | `DomainEvent` base class, `AggregateRoot.record()` y `pullDomainEvents()` |
| `api-events` | `EventBus` interface, `Subscriber` abstract — cómo se consumen los eventos |
| `api-events-infra` | `AmqpMessageBus` — cómo se publican y consumen en RabbitMQ |
| `api-application` | Cuándo llamar a `eventBus.publish()` en el use case |

## External Documentation

- [Domain Events — Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) — definición canónica
- [NestJS — Event Emitter](https://docs.nestjs.com/techniques/events) — alternativa in-process (no usamos esta, usamos AMQP)
- [RabbitMQ — Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript) — cómo funciona el exchange con `eventName` como routing key

## Event Naming Reference

```
Namespace:  ididntcatchthat
Context:    content | gaming | identity | progress | ranking
Entity:     flashcard | game | user | attempt | stat
Verb:       created | updated | deleted | completed | recorded | migrated
```

Ejemplos canónicos del proyecto:
- `ididntcatchthat.content.flashcard.created`
- `ididntcatchthat.gaming.games.game.completed`
- `ididntcatchthat.gaming.attempts.attempt.recorded`
- `ididntcatchthat.identity.guest_progress.migrated`

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [domain/rabbitmq-design.md](../../../docs/domain/rabbitmq-design.md) | Naming canónico de exchanges, colas, retry y DLQ — la fuente de verdad para `EVENT_NAME` |
| [domain/bounded-contexts.md](../../../docs/domain/bounded-contexts.md) | Qué eventos fluyen entre qué BCs — contexto de cada evento |
| [adr/019-event-bus-strategy.md](../../../docs/adr/019-event-bus-strategy.md) | Decisión: por qué AMQP async en lugar de EventEmitter in-process |
| [engineering-principles.md](../../../docs/engineering-principles.md) | Por qué los eventos tienen atributos primitivos (inmutabilidad, serialización) |
