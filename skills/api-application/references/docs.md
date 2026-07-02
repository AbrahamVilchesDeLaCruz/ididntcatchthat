# api-application — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain` | Aggregate, Value Objects y Domain Errors que el use case consume |
| `api-di` | Cómo definir tokens y registrar el use case como provider |
| `api-infrastructure` | Cómo el controller construye el `Request*` y llama al use case |
| `api-events` | `EventBus` interface y cómo publicar domain events |
| `api-testing` | Cómo testear use cases con jest-mock-extended y Object Mothers |

## External Documentation

- [NestJS — Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers) — inyección con `@Inject(TOKEN)`
- [NestJS — Circular Dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — cómo evitar dependencias circulares entre use cases

## Architectural Decisions

- La capa application **nunca** importa de `@nestjs/common` (salvo `@Injectable` y `@Inject`)
- Domain Services vs Use Cases: los Domain Services coordinan lógica de dominio **pura**; los Use Cases coordinan infraestructura (repositorios, eventBus, logger)
- Un Use Case = una transacción de negocio. Si necesitas dos acciones atómicas, consideran un Use Case que las coordine o un Domain Service compartido.

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [engineering-principles.md](../../../docs/engineering-principles.md) | SRP — un use case = una razón para cambiar; inversión de dependencias |
| [backend-architecture.md](../../../docs/backend-architecture.md) | Qué puede importar Application (Domain sí, Infrastructure no) |
| [domain/bounded-contexts-detail.md](../../../docs/domain/bounded-contexts-detail.md) | Use cases existentes por BC — evita duplicar lógica ya implementada |
