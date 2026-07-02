# tdd-workflow — Docs & References

## Related Skills

| Skill | Por qué leerla antes de ejecutar TDD |
|---|---|
| `api-testing` | Pirámide, Object Mothers, mocks con jest-mock-extended |
| `api-domain` | Templates de aggregate y VO — punto de partida del test rojo |
| `api-application` | Template de use case — lo que se testea en integración |
| `client-testing` | RTL, `renderHook`, MSW — TDD en el cliente |

## External Documentation

- [Test-Driven Development by Example (Beck)](https://www.oreilly.com/library/view/test-driven-development/0321146530/) — el libro base
- [Growing Object-Oriented Software Guided by Tests (Freeman & Pryce)](https://www.pearson.com/en-us/subject-catalog/p/growing-object-oriented-software-guided-by-tests/P200000009397) — TDD outside-in
- [Kent Beck — TDD](https://medium.com/@kentbeck_7670/test-driven-development-by-example-a-chapter-b9e42f8bc0ba) — artículo del autor
- [Jest — Getting Started](https://jestjs.io/docs/getting-started) — API de Jest
- [Vitest — Getting Started](https://vitest.dev/guide/) — API de Vitest

## Red → Green → Refactor cycle

```
RED:     Write the minimal failing test
          → run: pnpm test --watch

GREEN:   Write the minimal code to make it pass
          → no optimizations yet, just make it green

REFACTOR: Clean up without breaking tests
          → extract, rename, simplify — tests must stay green
          → commit after each successful refactor step
```

## TDD in this project

- **api (Jest)**: `pnpm --filter @ididntcatchthat/api test --watch`
- **client (Vitest)**: `pnpm --filter @ididntcatchthat/client test --watch`
