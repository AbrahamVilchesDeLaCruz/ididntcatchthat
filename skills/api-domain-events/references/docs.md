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
- `ididntcatchthat.gaming.game.completed`
- `ididntcatchthat.gaming.attempt.recorded`
- `ididntcatchthat.identity.guest-progress.migrated`
