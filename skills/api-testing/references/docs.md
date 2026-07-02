# api-testing — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-application` | Use cases — lo que se testea principalmente |
| `api-domain` | Aggregates y VOs — para construir los Object Mothers |
| `api-domain-events` | Domain Events — cómo afirmar que se publicaron |

## External Documentation

- [Jest — Docs](https://jestjs.io/docs/getting-started) — test runner y assertions
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended) — `mock<T>()` para interfaces TypeScript
- [Faker.js v9 — Docs](https://fakerjs.dev/api/) — generación de datos de prueba (usada en `MotherCreator`)
- [Jest — Fake Timers](https://jestjs.io/docs/timer-mocks) — `jest.useFakeTimers()` para controlar `new Date()`
- [Jest — Mock Functions](https://jestjs.io/docs/mock-functions) — `mockResolvedValueOnce`, `mockReset`

## Templates disponibles

- `assets/object-mother.template.md` — template genérico de Object Mother

## Test pyramid numbers (reference)

| Layer | Tests | Duration target |
|---|---|---|
| Unit (domain) | Many — 1 per invariant | < 1ms each |
| Integration (use case) | 2–5 per use case | < 50ms each |
| E2E (HTTP) | 1–2 per endpoint | < 2s each |

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [testing.md](../../../docs/testing.md) | Cómo ejecutar tests en el monorepo, pirámide real del proyecto, comandos |
| [engineering-principles.md](../../../docs/engineering-principles.md) | Por qué testear el comportamiento, no la implementación (TDD, inversión de dependencias) |
