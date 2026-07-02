# api-bc-review — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain` | Aggregate, Value Objects, Repository interface — qué revisar en domain/ |
| `api-application` | Use Cases, Domain Services — qué revisar en application/ |
| `api-infrastructure` | Controllers, TypeORM entities — qué revisar en infrastructure/ |
| `api-di` | Tokens, módulos — cómo evaluar el grafo de dependencias |
| `api-events` | Subscriber, EventBus — revisión del flujo de eventos |
| `api-testing` | Object Mothers, mocks — cómo evaluar la calidad de los tests |

## DDD References

- [Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) — Bounded Context, Aggregate, Ubiquitous Language
- [Implementing DDD (Vaughn Vernon)](https://vaughnvernon.com/?page_id=168) — patrones tácticos con ejemplos
- [Patterns, Principles, and Practices of DDD (Millett & Tune)](https://www.oreilly.com/library/view/patterns-principles-and/9781118714706/) — Strategic Design

## Architectural Decisions in This Project

- BCs comunican solo via domain events (AMQP) o API calls — nunca shared repositories
- Un BC puede tener múltiples módulos NestJS internos si tiene mucha carga
- El `shared/` dentro de un BC exporta interfaces, no implementaciones
