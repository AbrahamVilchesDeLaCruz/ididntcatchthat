# client-testing — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `client-container-presentational` | Qué testear con props mockeadas (Component) vs MSW (Container) |
| `client-api` | Mappers — se testean como funciones puras con Vitest |
| `client-hooks` | Hooks — se testean con `renderHook` + `act` |
| `client-query` | Queries y mutations — mockeadas con MSW en tests de Container |

## External Documentation

- [Vitest — Docs](https://vitest.dev/guide/) — test runner para el cliente
- [React Testing Library — Docs](https://testing-library.com/docs/react-testing-library/intro) — `render`, `screen`, `fireEvent`, `waitFor`
- [RTL — `renderHook`](https://testing-library.com/docs/react-testing-library/api/#renderhook) — hooks de estado
- [Mock Service Worker (MSW) v2 — Docs](https://mswjs.io/docs/) — interceptor de fetch/axios
- [Playwright — Docs](https://playwright.dev/docs/intro) — E2E con navegador real
- [TanStack Query — Testing](https://tanstack.com/query/v5/docs/framework/react/guides/testing) — cómo testear con `QueryClient`

## MSW setup (vitest)

```typescript
// vitest.setup.ts
import { server } from './__mocks__/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// __mocks__/server.ts
import { setupServer } from 'msw/node';
export const server = setupServer();
```
