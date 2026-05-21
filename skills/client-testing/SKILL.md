# client-testing

Testing del cliente `apps/client/`. Vitest + React Testing Library para unit/integration, Playwright para E2E.

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

## Unit tests — hooks y mappers

### Mappers

Los mappers son funciones puras — fáciles de testear:

```ts
// flashcards.mapper.test.ts
import { mapFlashcard } from '../flashcards.mapper';

describe('mapFlashcard', () => {
  it('transforma snake_case a camelCase', () => {
    const raw = {
      id: 'abc',
      front_text: 'Hello',
      back_text: 'Hola',
      difficulty: 'easy' as const,
      next_review_at: '2026-05-21T10:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
    };

    const result = mapFlashcard(raw);

    expect(result.frontText).toBe('Hello');
    expect(result.backText).toBe('Hola');
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });
});
```

### Hooks del pod

Usar `renderHook` de RTL:

```ts
// hooks/useFlashcardFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFlashcardFilters } from './useFlashcardFilters';

describe('useFlashcardFilters', () => {
  it('inicializa con valores por defecto', () => {
    const { result } = renderHook(() => useFlashcardFilters());
    const [state] = result.current;

    expect(state.difficulty).toBeNull();
    expect(state.showReviewOnly).toBe(false);
  });

  it('setDifficulty actualiza el estado', () => {
    const { result } = renderHook(() => useFlashcardFilters());

    act(() => {
      const [, handlers] = result.current;
      handlers.setDifficulty('hard');
    });

    const [state] = result.current;
    expect(state.difficulty).toBe('hard');
  });

  it('resetFilters vuelve a los valores por defecto', () => {
    const { result } = renderHook(() => useFlashcardFilters());

    act(() => {
      const [, handlers] = result.current;
      handlers.setDifficulty('easy');
      handlers.resetFilters();
    });

    const [state] = result.current;
    expect(state.difficulty).toBeNull();
  });
});
```

---

## Integration tests — Component con RTL

Testear el Component aislado, sin queries reales:

```tsx
// FlashcardsComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardsComponent } from './FlashcardsComponent';
import { FlashcardMother } from './__tests__/FlashcardMother';

describe('FlashcardsComponent', () => {
  const defaultProps = {
    flashcards: FlashcardMother.list(3),
    isLoading: false,
    isError: false,
    onDelete: vi.fn(),
    onPageChange: vi.fn(),
  };

  it('renderiza la lista de flashcards', () => {
    render(<FlashcardsComponent {...defaultProps} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('muestra spinner cuando isLoading es true', () => {
    render(<FlashcardsComponent {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('llama onDelete al confirmar eliminación', async () => {
    const onDelete = vi.fn();
    render(<FlashcardsComponent {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onDelete).toHaveBeenCalledWith(defaultProps.flashcards[0].id);
  });
});
```

### Object Mother para tests del cliente

```ts
// __tests__/FlashcardMother.ts
import { FlashcardVM } from '../flashcards.types';

export class FlashcardMother {
  static one(overrides?: Partial<FlashcardVM>): FlashcardVM {
    return {
      id: 'test-id-1',
      frontText: 'What is connected speech?',
      backText: 'When words blend together in natural speech',
      difficulty: 'medium',
      nextReviewAt: new Date('2026-06-01'),
      ...overrides,
    };
  }

  static list(count: number): FlashcardVM[] {
    return Array.from({ length: count }, (_, i) =>
      FlashcardMother.one({ id: `test-id-${i + 1}` }),
    );
  }
}
```

---

## Integration tests — Container con MSW

Para testear el Container con queries reales mockeadas:

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
          { id: '1', front_text: 'Hello', back_text: 'Hola', difficulty: 'easy',
            next_review_at: '2026-06-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
        ]),
      ),
    );

    render(<FlashcardsContainer />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });
});
```

---

## E2E — Playwright

Solo para flujos críticos de usuario:

```ts
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

---

## Comandos

```bash
# Desde apps/client/
pnpm test           # Vitest — unit + integration
pnpm test:e2e       # Playwright — E2E
pnpm test:coverage  # Cobertura
```

---

## Reglas

- Los mappers y hooks puros: siempre unit tests
- Los Components: integration tests con RTL (sin queries reales)
- Los Containers: integration tests con MSW (queries mockeadas)
- E2E solo para flujos críticos — no testear todo con Playwright
- Nunca mockear el módulo completo de TanStack Query — usar MSW para interceptar HTTP
