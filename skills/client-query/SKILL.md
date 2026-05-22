---
name: client-query
description: >
  TanStack Query: queries, mutations, query keys, invalidación en apps/client/.
  Trigger: Al usar useQuery, useMutation, definir query keys, o invalidar queries tras una mutation.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

# client-query

Cómo usar TanStack Query en `apps/client/`. Las queries y mutations viven en `api/{feature}.api.ts` dentro de cada pod.

---

## Regla fundamental

- **`useQuery`** → en el Container (data fetching)
- **`useMutation`** → en el Container (side effects)
- El Component **nunca** llama a queries ni mutations directamente

---

## Query Keys

Las query keys son arrays. Deben ser **consistentes** dentro del pod:

```ts
// Patrón: [dominio, recurso, params]
['flashcards', 'list', { deckId, page }]
['flashcards', 'detail', flashcardId]
['pronunciation', 'attempts', { userId }]
```

Exportar las keys como constantes para reutilizarlas en invalidaciones:

```ts
// flashcards.api.ts
export const flashcardKeys = {
  all: ['flashcards'] as const,
  lists: () => [...flashcardKeys.all, 'list'] as const,
  list: (params: FlashcardListParams) => [...flashcardKeys.lists(), params] as const,
  detail: (id: string) => [...flashcardKeys.all, 'detail', id] as const,
};
```

---

## useQuery — data fetching

```ts
// flashcards.api.ts
export const useFlashcards = (params: FlashcardListParams) => {
  return useQuery({
    queryKey: flashcardKeys.list(params),
    queryFn: () => apiClient.get<FlashcardApiModel[]>('/flashcards', { params }),
    select: (data) => data.map(mapFlashcard),  // mapper aquí si es simple
    staleTime: 1000 * 60 * 5,                  // 5 min — ajustar según necesidad
  });
};

export const useFlashcard = (id: string) => {
  return useQuery({
    queryKey: flashcardKeys.detail(id),
    queryFn: () => apiClient.get<FlashcardApiModel>(`/flashcards/${id}`),
    select: mapFlashcard,
    enabled: !!id,  // no ejecutar si no hay id
  });
};
```

---

## useMutation — side effects

```ts
// flashcards.api.ts
export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFlashcardPayload) =>
      apiClient.post<FlashcardApiModel>('/flashcards', data),
    onSuccess: () => {
      // Invalida todas las listas — el Container no necesita saber cómo
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/flashcards/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      queryClient.removeQueries({ queryKey: flashcardKeys.detail(id) });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFlashcardPayload }) =>
      apiClient.patch<FlashcardApiModel>(`/flashcards/${id}`, data),
    onSuccess: (updated) => {
      // Actualiza el cache directamente — evita refetch innecesario
      queryClient.setQueryData(flashcardKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
    },
  });
};
```

---

## Uso en el Container

```tsx
// FlashcardsContainer.tsx
export const FlashcardsContainer = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [page, setPage] = useState(1);

  const { data: flashcards = [], isLoading, isError } = useFlashcards({ deckId, page });
  const { mutate: deleteFlashcard, isPending: isDeleting } = useDeleteFlashcard();

  return (
    <FlashcardsComponent
      flashcards={flashcards}
      isLoading={isLoading}
      isError={isError}
      isDeleting={isDeleting}
      onDelete={(id) => deleteFlashcard(id)}
      onPageChange={setPage}
    />
  );
};
```

---

## Invalidación

| Cuándo | Qué invalidar |
|---|---|
| Crear un item | `invalidateQueries(keys.lists())` |
| Eliminar un item | `invalidateQueries(keys.lists())` + `removeQueries(keys.detail(id))` |
| Actualizar un item | `setQueryData(keys.detail(id), updated)` + `invalidateQueries(keys.lists())` |
| Acción que afecta múltiples recursos | `invalidateQueries({ queryKey: ['flashcards'] })` — invalida todo el dominio |

---

## Estados de UI de la query

Usar los estados de TanStack Query directamente — no duplicar en `useState`:

```tsx
// ✅ correcto
const { data, isLoading, isError, isFetching } = useFlashcards(params);

// ❌ incorrecto — duplicar estado
const [loading, setLoading] = useState(false);
```

---

## staleTime por defecto

Configurar en el `QueryClient` global (`core/`):

```ts
// core/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 min por defecto
      retry: 1,
    },
  },
});
```

Sobreescribir por query solo cuando sea necesario (datos muy dinámicos → `staleTime: 0`, datos estáticos → `staleTime: Infinity`).
