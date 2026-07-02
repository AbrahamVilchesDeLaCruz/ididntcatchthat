# API Layer Template

File structure for the `api/` folder inside a pod.

## `{pod-name}.api-model.ts` — Raw API types

```typescript
// Raw response from the backend — snake_case, strings for dates
export type {PodName}ApiModel = {
  id: string;
  user_id: string | null;
  some_field: string;
  numeric_field: number;
  status: '{status-a}' | '{status-b}';
  created_at: string;       // ISO string from API
  updated_at: string | null;
};

// For paginated responses
export type {PodName}ListApiResponse = {
  data: {PodName}ApiModel[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
};
```

## `{pod-name}.mapper.ts` — ApiModel → ViewModel

```typescript
import type { {PodName}ApiModel } from './{pod-name}.api-model';
import type { {PodName}VM } from '../{pod-name}.types';

export function map{PodName}({raw}: {PodName}ApiModel): {PodName}VM {
  return {
    id: raw.id,
    userId: raw.user_id,
    someField: raw.some_field,
    numericField: raw.numeric_field,
    status: raw.status,
    createdAt: new Date(raw.created_at),
    updatedAt: raw.updated_at ? new Date(raw.updated_at) : null,
  };
}
```

## `{pod-name}.types.ts` — ViewModel types

```typescript
// camelCase, Date for temporal fields — no API details leak here
export type {PodName}VM = {
  id: string;
  userId: string | null;
  someField: string;
  numericField: number;
  status: '{status-a}' | '{status-b}';
  createdAt: Date;
  updatedAt: Date | null;
};

// Input type for mutations (what the form sends)
export type Create{PodName}Input = {
  someField: string;
  numericField: number;
};
```

## Checklist

- [ ] `api-model` usa `snake_case` — espeja el JSON que llega de la API
- [ ] ViewModel usa `camelCase` — convención TypeScript/JavaScript
- [ ] Fechas: `string` en ApiModel → `Date` en ViewModel (el mapper hace la conversión)
- [ ] El mapper es una función pura — fácil de testear con Vitest
- [ ] Nullables: `null` en ApiModel → `null` en ViewModel (no `undefined`)
- [ ] Los tipos del ViewModel **no importan** nada de `api-model` ni de la API
