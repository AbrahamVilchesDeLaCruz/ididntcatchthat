# Container + MSW Test Patterns — Reference

## Integration test — Container con MSW

```tsx
// FlashcardsContainer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server';
import { FlashcardsContainer } from './FlashcardsContainer';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('FlashcardsContainer', () => {
  it('carga y muestra flashcards desde la API', async () => {
    server.use(
      http.get('/flashcards', () =>
        HttpResponse.json([
          {
            id: '1',
            front_text: 'Hello',
            back_text: 'Hola',
            difficulty: 'easy',
            next_review_at: '2026-06-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
          },
        ]),
      ),
    );

    render(<FlashcardsContainer />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('muestra estado de error cuando la API falla', async () => {
    server.use(
      http.get('/flashcards', () =>
        HttpResponse.json({ message: 'Internal Error' }, { status: 500 }),
      ),
    );

    render(<FlashcardsContainer />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
```

## E2E — Playwright

Solo para flujos críticos de usuario (camino feliz + caso de error principal):

```typescript
// e2e/flashcards.spec.ts
import { test, expect } from '@playwright/test';

test('usuario puede crear y revisar una flashcard', async ({ page }) => {
  await page.goto('/flashcards');

  await page.getByRole('button', { name: 'New Flashcard' }).click();
  await page.getByLabel('Front').fill('What is liaison?');
  await page.getByLabel('Back').fill('Linking final consonant to initial vowel');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('What is liaison?')).toBeVisible();
});
```

## Setup MSW en Vitest

```typescript
// src/__mocks__/server.ts
import { setupServer } from 'msw/node';
export const server = setupServer();

// vitest.setup.ts
import { server } from './__mocks__/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Comandos

```bash
pnpm test           # Vitest — unit + integration
pnpm test:e2e       # Playwright — E2E
pnpm test:coverage  # Cobertura
```
