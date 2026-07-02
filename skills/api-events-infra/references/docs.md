# api-events-infra — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-events` | `EventBus`, `DomainEventConsumer`, `Subscriber` abstract — las interfaces |
| `api-domain-events` | `DomainEvent` base class — lo que `AmqpMessageBus` serializa/deserializa |
| `api-shared` | `SharedModule` — donde se registra `AmqpMessageBus` |
| `api-di` | Tokens `EVENT_BUS`, `DOMAIN_EVENT_CONSUMER`, `SUBSCRIBERS` |

## Architectural Decision

- ADR 019: [docs/adr/019-event-bus-strategy.md](../../docs/adr/019-event-bus-strategy.md)

## External Documentation

- [RabbitMQ — Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx) — cómo funciona la DLQ
- [RabbitMQ — TTL (per-message)](https://www.rabbitmq.com/docs/ttl#per-message-ttl-in-publishers) — `expiration` por mensaje para backoff exponencial
- [amqplib — Channel API](https://amqp-node.github.io/amqplib/channel_api.html) — `assertQueue`, `consume`, `ack`, `nack`, `publish`
- [NestJS — Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events) — `OnModuleInit` que usa `SubscribersBootstrapper`

## Retry flow diagram

```
Message fails
     ↓
ch.nack(msg, false, false)    ← no requeue to main queue
     ↓
handleError()
     ↓
retryCount < 3 ?
  YES → sendToQueue(.retry, { expiration: delay })
         ↓
         After TTL expires → .retry DLX → main queue (retry)
  NO  → sendToQueue(.dead_letter, { headers: { reason } })
         ↓
         Manual intervention required
```
