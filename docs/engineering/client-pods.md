# Client Pods — Rutas, Endpoints y Lógica

> Referencia de todos los pods del cliente (`apps/client/`): rutas que los renderizan, endpoints que consumen y lógica de cada uno.
>
> Para la arquitectura base (Container-Presentational, estructura de carpetas, naming) ver [frontend-architecture.md](./frontend-architecture.md).

---

## Routing global

Definido en `src/core/router/AppRouter.tsx`.

| Ruta                     | View             | Pod                     | Protegida             |
| ------------------------ | ---------------- | ----------------------- | --------------------- |
| `/`                      | `LandingView`    | `landing`               | No                    |
| `/auth/:mode`            | `AuthView`       | `auth`                  | No                    |
| `/backoffice/*`          | `BackofficeView` | según sub-ruta          | Sí (`ProtectedRoute`) |
| `/backoffice/flashcards` | `BackofficeView` | `backoffice/flashcards` | Sí                    |
| `*`                      | —                | —                       | — → redirect `/`      |

`ProtectedRoute` lee `isAuthenticated` del store Zustand. Si es `false`, redirige a `/auth/login`.

---

## Core

### `core/api/apiClient.ts`

Instancia de axios con:

- `baseURL`: `VITE_API_URL` (Doppler en dev) o `/api/v1` como fallback (Docker via nginx proxy)
- `withCredentials: true` → necesario para que el browser envíe la cookie `refreshToken` httpOnly
- **Interceptor request**: adjunta `Authorization: Bearer <accessToken>` si hay token en el store
- **Interceptor response (401)**: intenta refresh automático → `POST /auth/refresh`. Si falla, hace logout y redirige a `/auth/login`

### `core/store/auth.store.ts`

Zustand store persistido (localStorage).

| Campo             | Tipo             | Descripción                                      |
| ----------------- | ---------------- | ------------------------------------------------ |
| `isAuthenticated` | `boolean`        | Único campo persistido — el token NO se persiste |
| `accessToken`     | `string \| null` | Solo en memoria — se pierde al recargar          |

> El `accessToken` no se persiste por seguridad. Al recargar la página, el interceptor de refresh lo recupera automáticamente si la cookie `refreshToken` httpOnly sigue válida.

### `core/router/AppRouter.tsx`

BrowserRouter con rutas declarativas. `ProtectedRoute` es un wrapper inline — no es un componente global reutilizable intencionalmente (una sola ruta protegida por ahora).

---

## Pod: `auth`

**Ruta**: `/auth/:mode` donde `mode` es `login` | `register`

**Responsabilidad**: login y registro de usuarios. El mismo pod maneja ambos modos con un parámetro de ruta.

### Endpoints consumidos

| Método | Endpoint         | Hook          | Cuándo                              |
| ------ | ---------------- | ------------- | ----------------------------------- |
| `POST` | `/auth/login`    | `useLogin`    | Al enviar el formulario de login    |
| `POST` | `/auth/register` | `useRegister` | Al enviar el formulario de registro |
| `POST` | `/auth/logout`   | `useLogout`   | Desde `BackofficeSidebar`           |

### Lógica

```
/auth/:mode
  └── AuthView
        └── AuthContainer
              ├── Lee `mode` de useParams → 'login' | 'register'
              ├── Conecta useLogin / useRegister (TanStack Mutation)
              ├── onSuccess → setAccessToken en Zustand + navigate /backoffice/flashcards
              ├── handleModeChange → navigate /auth/login o /auth/register
              └── AuthComponent
                    ├── useAuthForm(initialMode) → [state, handlers]
                    ├── Alterna entre AuthLoginForm y AuthRegisterForm según mode
                    └── Props: mode, isLoading, error, onLogin, onRegister, onModeChange
```

**Flujo de autenticación exitosa:**

1. Mutation `POST /auth/register` o `POST /auth/login`
2. API responde `{ accessToken }` + setea cookie httpOnly `refreshToken`
3. `setAccessToken(accessToken)` en Zustand → `isAuthenticated = true`
4. Redirect a `/backoffice/flashcards`

**Hook `useAuthForm`:**

- Retorna tupla `[state, handlers]`
- Encapsula `loginValues`, `registerValues` y los setters de campo
- Evita que `AuthComponent` tenga 6+ `useState` sueltos

### Tipos

```ts
type AuthMode = "login" | "register";

interface LoginFormValues {
  email: string;
  password: string;
}
interface RegisterFormValues {
  email: string;
  password: string;
  nickname: string;
}
```

---

## Pod: `backoffice/flashcards`

**Ruta**: `/backoffice/flashcards`

**Responsabilidad**: CRUD completo de flashcards para el backoffice de contenido. Solo accesible para usuarios autenticados.

### Endpoints consumidos

| Método   | Endpoint          | Hook                 | Cuándo                                       |
| -------- | ----------------- | -------------------- | -------------------------------------------- |
| `GET`    | `/flashcards`     | `useFlashcards`      | Al montar el pod y al cambiar filtros/página |
| `GET`    | `/flashcards/:id` | `useFlashcard`       | (disponible, no usado en la UI actual)       |
| `POST`   | `/flashcards`     | `useCreateFlashcard` | Al confirmar el modal de creación            |
| `PATCH`  | `/flashcards/:id` | `useUpdateFlashcard` | Al confirmar el modal de edición             |
| `DELETE` | `/flashcards/:id` | `useDeleteFlashcard` | Al confirmar el diálogo de eliminación (soft delete) |
| `POST`   | `/flashcards/:id/audio/regenerates` | `useRegenerateFlashcardAudio` | Detalle: generar/reintentar audio (`pending`, `generating`, `failed`) |
| `POST`   | `/flashcards/audio/regenerates` | `useRegenerateFlashcardAudioBulk` | Toolbar: bulk cuando filtro `pending` o `failed` |

### Query Keys

```ts
flashcardKeys = {
  all: ["backoffice", "flashcards"],
  lists: ["backoffice", "flashcards", "list"],
  list: ["backoffice", "flashcards", "list", params],
  detail: ["backoffice", "flashcards", "detail", id],
};
```

Tras cualquier mutación (create/update/delete) se invalida `lists()` para refrescar la tabla. Tras update también se invalida `detail(id)`.

### Lógica

```
/backoffice/flashcards
  └── BackofficeView
        └── BackofficeFlashcardsContainer
              ├── Estado: page (número), categoryFilter (string | undefined)
              ├── useFlashcards({ page, pageSize: 20, category }) → data paginada
              ├── useCreateFlashcard / useUpdateFlashcard / useDeleteFlashcard / useRegenerateFlashcardAudio
              ├── handleCreate  → genera UUID en cliente + llama mutation
              ├── handleUpdate  → pasa id + data parcial
              ├── handleDelete  → pasa id
              └── BackofficeFlashcardsComponent
                    ├── Estado UI: isCreateModalOpen, editingFlashcard, deletingId
                    ├── FlashcardsToolbar   → filtro por categoría
                    ├── FlashcardsTable     → lista con acciones Edit/Delete
                    ├── FlashcardFormModal  → formulario compartido Create/Edit
                    └── Diálogo de confirmación Delete (inline)
```

**Paginación**: el container controla `page` con `useState`. La API recibe `page` + `pageSize=20`. El component calcula `totalPages = ceil(total / pageSize)` y renderiza los botones Anterior/Siguiente.

**Mapper** (`flashcards.mapper.ts`):

- `mapFlashcard(raw)` → convierte `createdAt`/`updatedAt` de `string` ISO a `Date`
- `mapFlashcardsPage(raw)` → mapea `data[]` a `items[]` (renombra el campo) y aplica `mapFlashcard` a cada item

### ViewModel vs API Model

| Campo API                   | Campo VM               | Transformación            |
| --------------------------- | ---------------------- | ------------------------- |
| `data: FlashcardApiModel[]` | `items: FlashcardVM[]` | Renombrado + mapeado      |
| `createdAt: string`         | `createdAt: Date`      | `new Date(raw.createdAt)` |
| `updatedAt: string`         | `updatedAt: Date`      | `new Date(raw.updatedAt)` |

### Tipos principales

```ts
interface FlashcardVM {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioStatus: "pending" | "generating" | "ready" | "failed";
  examples: FlashcardExampleVM[];
  createdAt: Date;
  updatedAt: Date;
}

type FlashcardFormValues = {
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string;
  nativeSpeech: string;
  examples: FlashcardExampleVM[];
};
```

---

## Pod: `landing`

**Ruta**: `/`

**Responsabilidad**: página de marketing — sin autenticación, sin endpoints de API.

### Estructura

```
landing/
├── LandingContainer.tsx    ← trivial, solo renderiza LandingComponent
├── LandingComponent.tsx    ← composición de secciones
└── components/
    ├── LandingHero.tsx
    ├── LandingProblem.tsx
    ├── LandingHowItWorks.tsx
    ├── LandingModules.tsx
    ├── LandingNotify.tsx
    └── LandingFooter.tsx
```

No consume endpoints. No tiene estado de servidor.

---

## Layout: `BackofficeSidebar`

**Archivo**: `src/layout/BackofficeSidebar.tsx`

No es un pod — es un componente de layout que se monta en `BackofficeView`.

**Responsabilidades:**

- Navegación entre secciones del backoffice (`NavLink` a `/backoffice/flashcards`)
- Logout: llama `POST /auth/logout` via `useLogout`, luego limpia el store Zustand y redirige a `/`

---

## Diagrama de flujo de autenticación

```
Browser                nginx              API
  │                      │                 │
  │ POST /api/v1/auth/register             │
  │─────────────────────>│                 │
  │                      │ POST /v1/auth/register
  │                      │────────────────>│
  │                      │   { accessToken }
  │                      │<────────────────│
  │  { accessToken }     │   Set-Cookie: refreshToken=<id>; HttpOnly
  │<─────────────────────│                 │
  │                      │                 │
  │ (accessToken en memoria — Zustand)     │
  │ (refreshToken en cookie HttpOnly — browser automático)
```

```
Browser                nginx              API
  │                      │                 │
  │ GET /api/v1/flashcards (Authorization: Bearer <token>)
  │─────────────────────>│                 │
  │                      │ GET /v1/flashcards
  │                      │────────────────>│
  │                      │   { data, total, page, pageSize }
  │                      │<────────────────│
  │  { data, ... }       │                 │
  │<─────────────────────│                 │
  │                      │                 │
  │ (mapper: data[] → items[], string → Date)
  │ (TanStack Query cachea el resultado)
```
