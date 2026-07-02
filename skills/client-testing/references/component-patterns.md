# Client Component Test Patterns — Reference

## Unit test — Mapper (función pura)

```typescript
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

## Unit test — Hook del pod

```typescript
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

## Integration test — Component con RTL

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

## Object Mother para tests del cliente

```typescript
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
