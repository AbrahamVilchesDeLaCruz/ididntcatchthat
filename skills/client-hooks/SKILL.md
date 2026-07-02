---
name: client-hooks
description: "Hooks del pod [State, Handlers], hooks globales, cuándo extraer en apps/client/. Trigger: Al crear hooks de estado o handlers en un pod, extraer lógica a hooks globales, o decidir cuándo crear un hook."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


Hooks del pod y hooks globales en `apps/client/`.

> Usa el template de `assets/use-state-handlers.template.md` al extraer `use{Pod}State` y `use{Pod}Handlers`.
> Lee `references/docs.md` para el rationale del patrón tupla y docs externos.

---

## Dos tipos de hooks

| Tipo | Ubicación | Alcance |
|---|---|---|
| Hooks del pod | `containers/{feature}/hooks/` | Solo dentro del pod |
| Hooks globales | `core/hooks/` o `common/hooks/` | Reutilizables entre pods |

---

## Hooks del pod

### Cuándo crear uno

- Cuando hay un grupo de `useState` + handlers cohesionados (filtros, tooltips, paginación, selección)
- Cuando el Component tiene más de ~5 `useState` → señal de que hay hooks por extraer
- Cuando la lógica se puede nombrar con un sustantivo claro: `filters`, `tooltip`, `pagination`

### Naming

- Archivo: `camelCase.ts` → `useFlashcardFilters.ts`
- Export: `camelCase` → `useFlashcardFilters`
- Barrel obligatorio: `hooks/index.ts` re-exporta todo

### Patrón de retorno — tupla `[State, Handlers]`

Los hooks del pod retornan siempre una tupla para desestructurar limpiamente en el Component:

```ts
// hooks/useFlashcardFilters.ts

interface FlashcardFiltersState {
  difficulty: 'easy' | 'medium' | 'hard' | null;
  showReviewOnly: boolean;
}

interface FlashcardFiltersHandlers {
  setDifficulty: (d: FlashcardFiltersState['difficulty']) => void;
  toggleReviewOnly: () => void;
  resetFilters: () => void;
}

export const useFlashcardFilters = (): [FlashcardFiltersState, FlashcardFiltersHandlers] => {
  const [difficulty, setDifficulty] = useState<FlashcardFiltersState['difficulty']>(null);
  const [showReviewOnly, setShowReviewOnly] = useState(false);

  const resetFilters = () => {
    setDifficulty(null);
    setShowReviewOnly(false);
  };

  return [
    { difficulty, showReviewOnly },
    { setDifficulty, toggleReviewOnly: () => setShowReviewOnly(v => !v), resetFilters },
  ];
};
```

### Uso en el Component

```tsx
// FlashcardsComponent.tsx
export const FlashcardsComponent = ({ flashcards, ... }: FlashcardsComponentProps) => {
  const [filters, filterHandlers] = useFlashcardFilters();
  const [tooltip, tooltipHandlers] = useFlashcardTooltip();

  return (
    <div>
      <FlashcardToolbar
        filters={filters}
        onFilter={filterHandlers.setDifficulty}
        onReset={filterHandlers.resetFilters}
      />
      {flashcards.map(card => (
        <FlashcardItem
          key={card.id}
          card={card}
          onHover={tooltipHandlers.show}
        />
      ))}
      {tooltip.visible && <FlashcardTooltip {...tooltip} onClose={tooltipHandlers.close} />}
    </div>
  );
};
```

### Barrel del pod

```ts
// hooks/index.ts
export { useFlashcardFilters } from './useFlashcardFilters';
export { useFlashcardTooltip } from './useFlashcardTooltip';
export { useFlashcardPagination } from './useFlashcardPagination';
```

---

## Hooks globales

Hooks reutilizables entre pods — sin lógica de dominio.

### Ubicación

```
core/hooks/
├── useClickOutside.ts
├── useDebounce.ts
├── useLocalStorage.ts
└── index.ts
```

### Ejemplos

```ts
// useClickOutside.ts
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};
```

```ts
// useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
```

```ts
// useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const set = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, set] as const;
};
```

---

## Reglas

- Un hook del pod **no se importa desde otro pod** — si se necesita en dos pods, muévelo a `core/hooks/`
- Los hooks del pod pueden usar hooks globales
- Los hooks del pod **no hacen fetch** — eso es responsabilidad de `api.ts`
- Un hook global **no tiene lógica de dominio** — si la tiene, es un hook del pod
