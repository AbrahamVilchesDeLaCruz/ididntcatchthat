# api-domain — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain-events` | Cómo definir y registrar Domain Events en aggregates |
| `api-application` | Use Cases — consumen aggregates y Value Objects |
| `api-infrastructure` | TypeORM Entity vs. Aggregate — cómo separar la persistencia |
| `api-testing` | Object Mothers para aggregates y Value Objects |

## External Documentation

- [Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) — Aggregate, Value Object, Entity, Domain Event
- [Implementing DDD — Vaughn Vernon](https://vaughnvernon.com/?page_id=168) — patrones tácticos con TypeScript
- [TypeScript — readonly](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) — inmutabilidad en Value Objects

## Templates disponibles

- `assets/aggregate-root.template.md` — template de AggregateRoot
- `assets/value-object.template.md` — template de Value Object

## Invariants vs. Domain Errors

Las invariantes se validan en el constructor del Value Object o en el método del Aggregate que modifica estado. El Domain Error se lanza desde ahí — nunca desde el Use Case ni desde el Controller.

```typescript
// ✅ Invariante en el VO — lanza error antes de crear el objeto inválido
export class FlashcardFront extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim().length === 0) throw new FlashcardFrontEmpty();
    if (value.length > 500) throw new FlashcardFrontTooLong(value.length);
  }
}
```
