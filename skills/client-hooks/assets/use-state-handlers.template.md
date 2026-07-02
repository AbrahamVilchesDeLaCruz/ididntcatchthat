# State & Handlers Hook Template

Extract this pattern from the Container when it grows beyond ~80 lines of logic.

## `use{PodName}State.ts` — UI state only

```typescript
import { useState } from 'react';

export type {PodName}State = {
  selectedId: string | null;
  isModalOpen: boolean;
  filters: {PodName}Filters;
};

export type {PodName}Filters = {
  search: string;
  status: 'active' | 'inactive' | null;
};

const DEFAULT_FILTERS: {PodName}Filters = {
  search: '',
  status: null,
};

export function use{PodName}State(): [{PodName}State, {PodName}StateHandlers] {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{PodName}Filters>(DEFAULT_FILTERS);

  const handlers: {PodName}StateHandlers = {
    selectItem: (id: string) => setSelectedId(id),
    clearSelection: () => setSelectedId(null),
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    setFilter: <K extends keyof {PodName}Filters>(key: K, value: {PodName}Filters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  };

  return [{ selectedId, isModalOpen, filters }, handlers];
}

export type {PodName}StateHandlers = {
  selectItem: (id: string) => void;
  clearSelection: () => void;
  openModal: () => void;
  closeModal: () => void;
  setFilter: <K extends keyof {PodName}Filters>(key: K, value: {PodName}Filters[K]) => void;
  resetFilters: () => void;
};
```

## `use{PodName}Handlers.ts` — async handlers with side effects

```typescript
import { useCallback } from 'react';
import { useCreate{PodName}, useDelete{PodName} } from '../api/{pod-name}.api';
import type { Create{PodName}Input } from '../{pod-name}.types';

export function use{PodName}Handlers() {
  const create{PodName}Mutation = useCreate{PodName}();
  const delete{PodName}Mutation = useDelete{PodName}();

  const handleCreate = useCallback(async (input: Create{PodName}Input) => {
    try {
      await create{PodName}Mutation.mutateAsync(input);
    } catch (error) {
      // Handle error — show toast, etc.
    }
  }, [create{PodName}Mutation]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await delete{PodName}Mutation.mutateAsync(id);
    } catch (error) {
      // Handle error
    }
  }, [delete{PodName}Mutation]);

  return {
    handleCreate,
    handleDelete,
    isCreating: create{PodName}Mutation.isPending,
    isDeleting: delete{PodName}Mutation.isPending,
  };
}
```

## Usage in Container after extraction

```tsx
export function {PodName}Container() {
  const [state, stateHandlers] = use{PodName}State();
  const { data, isLoading, isError } = use{PodName}s(state.filters);
  const { handleCreate, handleDelete, isCreating } = use{PodName}Handlers();

  return (
    <{PodName}Component
      {podName}s={data ?? []}
      isLoading={isLoading}
      isError={isError}
      isCreating={isCreating}
      state={state}
      {...stateHandlers}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );
}
```

## When to extract

Extract to `use{PodName}State` when:
- Container has > 3 `useState` calls
- Multiple state variables are updated together

Extract to `use{PodName}Handlers` when:
- Container has > 3 async handlers
- Handlers share mutation state (isPending, errors)
- Handler logic needs `useCallback` for performance

## Checklist

- [ ] State hook returns `[state, handlers]` tuple — not an object
- [ ] Handlers hook returns named functions (not a tuple)
- [ ] No `useQuery` or `useMutation` in state hook — only `useState`
- [ ] Async handlers in `use{PodName}Handlers` — state handlers in `use{PodName}State`
- [ ] Default values for all state fields defined as constants outside the hook
