# Pod Scaffold

Use this as the directory structure reference when creating a new pod.

## Minimal Pod (feature simple)

```
pods/{pod-name}/
├── index.ts                          ← public API: re-exports only
├── {PodName}Container.tsx            ← fetching, state, handlers
├── {PodName}Component.tsx            ← pure presentational, no queries
├── {pod-name}.types.ts               ← ViewModel types (ViewModels only)
└── api/
    ├── {pod-name}.api-model.ts       ← raw API response types (snake_case)
    ├── {pod-name}.api.ts             ← fetch functions + TanStack Query hooks
    └── {pod-name}.mapper.ts          ← ApiModel → ViewModel
```

## Full Pod (with sub-components and hooks)

```
pods/{pod-name}/
├── index.ts
├── {PodName}Container.tsx
├── {PodName}Component.tsx
├── {pod-name}.types.ts
├── api/
│   ├── {pod-name}.api-model.ts
│   ├── {pod-name}.api.ts
│   └── {pod-name}.mapper.ts
├── components/                        ← sub-components (only for this pod)
│   ├── {PodName}Card.tsx
│   └── {PodName}Form.tsx
├── hooks/                             ← extracted hooks when > 80 lines
│   ├── use{PodName}State.ts
│   └── use{PodName}Handlers.ts
└── __tests__/
    ├── {PodName}Component.test.tsx
    ├── {PodName}Container.test.tsx
    ├── {pod-name}.mapper.test.ts
    └── {PodName}Mother.ts
```

## `index.ts` — public API

```typescript
// Only export what other parts of the app need
export { {PodName}Container } from './{PodName}Container';
export type { {PodName}VM } from './{pod-name}.types';
```

## `{pod-name}.types.ts`

```typescript
// ViewModel — camelCase, domain-friendly types
export type {PodName}VM = {
  id: string;
  // camelCase fields, Date instead of string for dates
  createdAt: Date;
};
```

## Naming rules

| File | Convention | Example |
|---|---|---|
| Container | `{PodName}Container.tsx` | `FlashcardsContainer.tsx` |
| Component | `{PodName}Component.tsx` | `FlashcardsComponent.tsx` |
| Types | `{pod-name}.types.ts` | `flashcards.types.ts` |
| API model | `{pod-name}.api-model.ts` | `flashcards.api-model.ts` |
| API hooks | `{pod-name}.api.ts` | `flashcards.api.ts` |
| Mapper | `{pod-name}.mapper.ts` | `flashcards.mapper.ts` |
| Hook | `use{PodName}{Purpose}.ts` | `useFlashcardsFilters.ts` |

## Checklist

- [ ] `index.ts` solo exporta lo necesario — no el Container y el Component internos a la vez si solo se usa el Container
- [ ] `{pod-name}.types.ts` contiene **solo ViewModels** — no tipos de API crudos
- [ ] `api/` tiene los 3 archivos: api-model, api.ts, mapper
- [ ] Sub-componentes en `components/` solo si este pod los necesita — si se comparten, van a `components/shared/`
- [ ] Hooks extraídos en `hooks/` cuando el Container supera ~80 líneas de lógica
