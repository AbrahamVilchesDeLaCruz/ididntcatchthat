# Container / Component Template

## Container — `{PodName}Container.tsx`

```tsx
import { use{PodName}s } from './api/{pod-name}.api';
import { useCreate{PodName} } from './api/{pod-name}.api';
import { {PodName}Component } from './{PodName}Component';
import type { Create{PodName}Input } from './{pod-name}.types';

export function {PodName}Container() {
  // 1. All data fetching here
  const { data: {podName}s, isLoading, isError } = use{PodName}s();
  const create{PodName}Mutation = useCreate{PodName}();

  // 2. All event handlers here
  const handleCreate = async (input: Create{PodName}Input) => {
    await create{PodName}Mutation.mutateAsync(input);
  };

  const handleDelete = async (id: string) => {
    // await delete{PodName}Mutation.mutateAsync(id);
  };

  // 3. Minimal JSX — just delegates to Component
  return (
    <{PodName}Component
      {podName}s={{podName}s ?? []}
      isLoading={isLoading}
      isError={isError}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );
}
```

## Component — `{PodName}Component.tsx`

```tsx
import type { {PodName}VM, Create{PodName}Input } from './{pod-name}.types';

type {PodName}ComponentProps = {
  {podName}s: {PodName}VM[];
  isLoading: boolean;
  isError: boolean;
  onCreate: (input: Create{PodName}Input) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function {PodName}Component({
  {podName}s,
  isLoading,
  isError,
  onCreate,
  onDelete,
}: {PodName}ComponentProps) {
  if (isLoading) return <div role="progressbar">Loading...</div>;
  if (isError) return <div role="alert">Something went wrong</div>;

  return (
    <div>
      {/* Pure UI — no queries, no mutations, no side effects */}
      {/* All interactions via props callbacks */}
      {{podName}s.map(({podName}) => (
        <article key={{podName}.id}>
          <p>{{podName}.someField}</p>
          <button onClick={() => onDelete({podName}.id)}>Delete</button>
        </article>
      ))}
    </div>
  );
}
```

## Contract rules (summary)

| Rule | Container | Component |
|---|---|---|
| TanStack Query hooks | ✅ Yes | ❌ Never |
| `useState` for UI state | ❌ Avoid | ✅ Yes |
| Event handlers (data ops) | ✅ Yes | ❌ Never |
| JSX complexity | ❌ Minimal | ✅ Full UI |
| Props | Receives none | Receives all data + callbacks |
| Test approach | RTL + MSW | RTL with mocked props |

## Checklist

- [ ] Container has zero styling / JSX beyond the Component call
- [ ] Component has zero `useQuery`, `useMutation`, `fetch` calls
- [ ] Every user interaction in Component calls a prop callback
- [ ] Component props are fully typed with explicit `type Props = {...}`
- [ ] Loading and error states handled in Component (not Container)
- [ ] Container handles async errors (try/catch or mutation `onError`)
