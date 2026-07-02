# api-events — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain-events` | Cómo se definen los `DomainEvent` que los subscribers consumen |
| `api-events-infra` | `AmqpMessageBus` — implementación de `EventBus` y `DomainEventConsumer` |
| `api-application` | Use cases — dónde se llama a `eventBus.publish()` |
| `api-di` | Cómo registrar `EVENT_BUS` y `DOMAIN_EVENT_CONSUMER` en módulos |

## Architectural Decision

- ADR 019: [docs/adr/019-event-bus-strategy.md](../../../docs/adr/019-event-bus-strategy.md)

## External Documentation

- [RabbitMQ — Concepts](https://www.rabbitmq.com/tutorials/amqp-concepts) — exchanges, queues, bindings, routing keys
- [RabbitMQ — Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript) — routing por topic (nuestro patrón)
- [amqplib — npm](https://www.npmjs.com/package/amqplib) — librería Node.js usada en `AmqpMessageBus`

## Why not NestJS EventEmitter?

NestJS EventEmitter es in-process — si el proceso muere, los eventos se pierden. RabbitMQ es durable y permite retry, DLQ y distribución entre múltiples instancias. Para un sistema de producción, el bus async es la elección correcta.

Ver ADR 019 para la decisión completa.

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [domain/rabbitmq-design.md](../../../docs/domain/rabbitmq-design.md) | Naming canónico de queues y exchanges, flujo retry→DLQ del proyecto |
| [domain/bounded-contexts.md](../../../docs/domain/bounded-contexts.md) | Qué eventos publica cada BC y cuáles consumen otros — el mapa completo |
| [adr/019-event-bus-strategy.md](../../../docs/adr/019-event-bus-strategy.md) | Decisión: AmqpMessageBus como implementación del EventBus |
| [backend-architecture.md](../../../docs/backend-architecture.md) | Por qué `Subscriber` no importa NestJS (regla de dependencia) |
