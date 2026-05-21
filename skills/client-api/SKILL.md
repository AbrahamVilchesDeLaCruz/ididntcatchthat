# client-api

Capa de acceso a datos de cada pod. Vive en `api/` dentro del pod y tiene tres responsabilidades: tipos crudos, hooks TanStack Query, y transformación de datos.

---

## Estructura

```
containers/{feature}/
└── api/
    ├── index.ts                    ← Barrel: re-exporta hooks y types
    ├── {feature}.api-model.ts     ← Tipos crudos de la respuesta del servidor
    └── {feature}.api.ts           ← Hooks TanStack Query (useQuery / useMutation)
```

Junto a `api/`, en la raíz del pod:

```
├── {feature}.mapper.ts            ← API response → ViewModel
└── {feature}.types.ts             ← Tipos del ViewModel (adaptados a la UI)
```

---

## `{feature}.api-model.ts` — tipos crudos

Representa **exactamente** lo que devuelve el servidor. Snake_case si el servidor usa snake_case.

```ts
// flashcards.api-model.ts
export interface FlashcardApiModel {
  id: string;
  front_text: string;
  back_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  next_review_at: string;   // ISO string
  created_at: string;
}

export interface CreateFlashcardPayload {
  front_text: string;
  back_text: string;
  deck_id: string;
}

export interface UpdateFlashcardPayload {
  front_text?: string;
  back_text?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

---

## `{feature}.types.ts` — ViewModel

Tipos **adaptados a la UI**. camelCase siempre. Fechas como `Date`, no strings.

```ts
// flashcards.types.ts
export interface FlashcardVM {
  id: string;
  frontText: string;
  backText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReviewAt: Date;
}
```

---

## `{feature}.mapper.ts` — transformación

Convierte el modelo crudo de la API al ViewModel que usa la UI.

```ts
// flashcards.mapper.ts
import { FlashcardApiModel } from './api/flashcards.api-model';
import { FlashcardVM } from './flashcards.types';

export const mapFlashcard = (raw: FlashcardApiModel): FlashcardVM => ({
  id: raw.id,
  frontText: raw.front_text,
  backText: raw.back_text,
  difficulty: raw.difficulty,
  nextReviewAt: new Date(raw.next_review_at),
});
```

---

## `{feature}.api.ts` — hooks TanStack Query

Ver skill `client-query` para el patrón completo de queries y mutations.

```ts
// flashcards.api.ts
export const flashcardKeys = {
  all: ['flashcards'] as const,
  lists: () => [...flashcardKeys.all, 'list'] as const,
  list: (params: FlashcardListParams) => [...flashcardKeys.lists(), params] as const,
  detail: (id: string) => [...flashcardKeys.all, 'detail', id] as const,
};

export const useFlashcards = (params: FlashcardListParams) => {
  return useQuery({
    queryKey: flashcardKeys.list(params),
    queryFn: () => apiClient.get<FlashcardApiModel[]>('/flashcards', { params }),
    select: (data) => data.map(mapFlashcard),
  });
};
```

---

## `api/index.ts` — barrel

Re-exporta todo lo público de la capa API:

```ts
// api/index.ts
export * from './flashcards.api';
export * from './flashcards.api-model';
```

---

## `index.ts` del pod — barrel raíz

Solo exporta el Container (punto de entrada del pod):

```ts
// containers/flashcards/index.ts
export { FlashcardsContainer } from './FlashcardsContainer';
```

---

## API client global

El cliente HTTP vive en `core/` y se importa desde cualquier pod:

```ts
// core/api/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // para cookies httpOnly (refresh token)
});

// Interceptor de auth — añade access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Reglas

- `api-model.ts` refleja el servidor tal cual — sin transformar
- `types.ts` refleja la UI tal cual — sin residuos del servidor
- El mapper es la única capa que conoce ambos mundos
- Los payloads de mutations van en `api-model.ts` (son contratos con el servidor)
- Nunca usar `any` en tipos de API — si no se sabe el tipo, usar `unknown` y validar con Zod
