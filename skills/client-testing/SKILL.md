---
name: client-testing
description: "Vitest + RTL (unit/integration), Playwright E2E, MSW en apps/client/. Trigger: Al crear tests de componentes con RTL, tests E2E con Playwright, o mocks de API con MSW."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear tests de mappers, hooks, Components o Containers
- Al configurar MSW para interceptar llamadas HTTP en tests
- Al escribir tests E2E con Playwright

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/component-patterns.md` para los patrones de unit tests (mappers, hooks) e integration tests de Component con RTL.
> Lee `references/container-msw.md` para integration tests de Container con MSW y tests E2E con Playwright.

---

## Pirámide de tests

```
         /\
        /E2E\          ← Playwright — flujos críticos de usuario
       /──────\
      /Integr. \       ← RTL — Container + Component juntos con MSW
     /──────────\
    /   Unit     \     ← Vitest — hooks, mappers, utils puros
   /______________\
```

---

## Qué testear con qué herramienta

| Qué | Nivel | Herramienta | Cuándo cargar referencia |
|---|---|---|---|
| Mappers | Unit | Vitest | `component-patterns.md` |
| Hooks del pod | Unit | Vitest + `renderHook` | `component-patterns.md` |
| Component (presentacional) | Integration | RTL | `component-patterns.md` |
| Container (con queries) | Integration | RTL + MSW | `container-msw.md` |
| Flujo crítico end-to-end | E2E | Playwright | `container-msw.md` |

---

## Object Mother del cliente

Mother en `__tests__/XxxMother.ts` junto al componente:

```typescript
export class FlashcardMother {
  static one(overrides?: Partial<FlashcardVM>): FlashcardVM { ... }
  static list(count: number): FlashcardVM[] { ... }
}
```

Usan literales fijos (no faker) — los tests del cliente priorizan legibilidad.

---

## Reglas

- Mappers y hooks puros → siempre unit tests (Vitest)
- Component (presentacional) → RTL, props mockeadas, sin queries
- Container → RTL + MSW, interceptar HTTP real
- E2E → Playwright, solo flujos críticos — camino feliz + error principal
- Nunca mockear el módulo completo de TanStack Query — usar MSW
- `server.use()` dentro del `it` para sobrescribir el handler por caso
- `server.resetHandlers()` en `afterEach` siempre

---

## Anti-patterns

```tsx
// ❌ Mockear TanStack Query directamente
vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

// ❌ Test E2E para todo — Playwright es lento y frágil
test('mapper transforma snake_case', () => { await page.goto(...) }); // unit test

// ❌ Container sin MSW — mockear la función de fetch
vi.mock('../flashcards.api', () => ({ getFlashcards: vi.fn() }));
```
