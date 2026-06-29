# Frontend Architecture — Pods + Container-Presentational

> Arquitectura del cliente de ididntcatchthat (`apps/client/`).

---

## 1. ¿Qué es la arquitectura por Pods?

Un **pod** es una unidad funcional autocontenida que encapsula toda la lógica, UI y acceso a datos de una funcionalidad concreta del dominio.

**Objetivos:**

- **Encapsulación**: todo lo de una feature vive junto
- **Escalabilidad**: agregar features no ensucia otras
- **Mantenibilidad**: un bug en `flashcards` no toca `pronunciation`
- **Bajo acoplamiento**: un pod NO importa de otro pod

---

## 2. Estructura global

```
apps/client/src/
├── common/        ← Componentes reutilizables sin dominio (Button, Input, Modal)
├── common-app/    ← Reutilizables pero ligados al dominio (CreateFlashcardPopup)
├── core/          ← Configuración global: router, auth, API client, interceptores
├── layout/        ← Plantillas visuales (Sidebar, Topbar, AppShell)
├── containers/    ← Pods organizados por dominio
└── views/         ← Páginas que seleccionan layout + renderizan pods
```

### Responsabilidades

| Carpeta       | Responsabilidad                                                       |
| ------------- | --------------------------------------------------------------------- |
| `common/`     | Componentes reutilizables sin dominio (botones, inputs, modals)       |
| `common-app/` | Reutilizables pero ligados al dominio (popups de negocio compartidos) |
| `core/`       | Router, auth, API client, interceptores, providers globales           |
| `layout/`     | Plantillas visuales — Sidebar, Topbar, shells de página               |
| `containers/` | Pods — cada carpeta es un dominio (`flashcards/`, `pronunciation/`)   |
| `views/`      | Páginas que componen layout + pods                                    |

---

## 3. Estructura interna de un Pod

```
containers/
└── calendar/
    ├── api/                              ← Capa de acceso a datos
    │   ├── index.ts                      ← Barrel: re-exporta todo
    │   ├── calendar.api-model.ts         ← Tipos de la respuesta cruda de la API
    │   └── calendar.api.ts               ← Funciones fetch (TanStack Query)
    ├── hooks/                            ← Hooks de UI del pod
    │   ├── useCalendarFilters.ts
    │   ├── useCalendarTooltip.ts
    │   ├── useCalendarDates.ts
    │   └── index.ts                      ← Barrel: re-exporta todos los hooks
    ├── components/                       ← Sub-componentes de presentación
    │   ├── CalendarGrid.tsx
    │   ├── CalendarToolbar.tsx
    │   ├── CalendarFilterChips.tsx
    │   └── AppointmentTooltip.tsx
    ├── CalendarContainer.tsx             ← Data binding (TanStack Query, routing, contexto)
    ├── CalendarComponent.tsx             ← Estado de UI + composición
    ├── calendar.mapper.ts                ← API response → ViewModel
    ├── calendar.types.ts                 ← Tipos del ViewModel (adaptados a la UI)
    ├── calendar.styles.ts                ← Estilos específicos del pod
    └── index.ts                          ← Barrel: exporta el Container
```

### Responsabilidades de cada archivo

| Archivo                     | Responsabilidad                                            |
| --------------------------- | ---------------------------------------------------------- |
| `CalendarContainer.tsx`     | Data binding + routing + contexto global                   |
| `CalendarComponent.tsx`     | Estado de UI + composición de sub-componentes              |
| `api/calendar.api.ts`       | Funciones fetch con TanStack Query                         |
| `api/calendar.api-model.ts` | Tipos de la respuesta cruda de la API                      |
| `api/index.ts`              | Barrel de la capa API                                      |
| `calendar.mapper.ts`        | Transformación API response → ViewModel                    |
| `calendar.types.ts`         | Tipos TypeScript del ViewModel (adaptados a la UI)         |
| `calendar.styles.ts`        | Estilos CSS-in-JS o clases específicas del pod             |
| `hooks/`                    | Custom hooks de UI del pod (estado encapsulado)            |
| `components/`               | Sub-componentes de presentación pura                       |
| `index.ts`                  | Barrel que exporta el Container (punto de entrada del pod) |

---

## 4. Patrón Container-Presentational

### 4.1 Container (`*Container.tsx`)

El container es la **puerta de entrada al mundo exterior**.

**Responsabilidades exclusivas:**

- Data binding: conexión a TanStack Query (queries y mutations)
- Routing: `useLocation`, `useParams`, `useNavigate`, `searchParams`
- Contexto global: `useContext`, Zustand store
- Side effects hacia afuera: mutations, navegación, redirecciones
- URLs derivadas: `useMemo` para construir parámetros de query

**Prohibiciones:**

- ❌ NO tiene `useState` de UI (no modals, no tooltips, no filtros visuales)
- ❌ NO tiene JSX complejo — solo renderiza `<CalendarComponent />` y le pasa props
- ❌ NO tiene `useEffect` (salvo sync trivial hacia afuera)
- ❌ NO hace transformaciones de datos (eso es el mapper)

```tsx
// ✅ CalendarContainer.tsx
export const CalendarContainer = () => {
  const { id } = useParams();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // TanStack Query
  const { data: events, isLoading } = useCalendarEvents({ month, year });
  const { mutate: createEvent } = useCreateEvent();

  return (
    <CalendarComponent
      events={events}
      isLoading={isLoading}
      onDateChange={(m, y) => {
        setMonth(m);
        setYear(y);
      }}
      onCreateEvent={createEvent}
    />
  );
};
```

### 4.2 Component (`*Component.tsx`)

El component es el **dueño de la UI**: estado visual, ciclo de vida React, composición.

**Responsabilidades:**

- Estado de UI: `useState` para modals, tooltips, filtros, toggles
- Ciclo de vida: `useEffect` para sincronizar estado de UI
- Refs imperativas: `useRef` para componentes de terceros, scroll, etc.
- Composición: renderiza sub-componentes de presentación
- Custom hooks del pod: consume hooks de `hooks/` que encapsulan lógica de UI

**Prohibiciones:**

- ❌ NO hace fetch de datos (no `useQuery`, no `fetch`)
- ❌ NO accede a routing (`useLocation`, `useNavigate`)
- ❌ NO accede a contexto global directamente

```tsx
// ✅ CalendarComponent.tsx
interface CalendarComponentProps {
  events: CalendarEventVM[];
  isLoading: boolean;
  onDateChange: (month: number, year: number) => void;
  onCreateEvent: (data: CreateEventPayload) => void;
}

export const CalendarComponent = ({
  events,
  isLoading,
  onDateChange,
  onCreateEvent,
}: CalendarComponentProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [filters, filterHandlers] = useCalendarFilters();
  const [tooltip, tooltipHandlers] = useCalendarTooltip();

  return (
    <div>
      <CalendarToolbar filters={filters} onFilter={filterHandlers.setTypeFilter} />
      <CalendarFilterChips filters={filters} onReset={filterHandlers.resetFilters} />
      <CalendarGrid ref={calendarRef} events={events} isLoading={isLoading} />
      {tooltip.visible && <AppointmentTooltip {...tooltip} onClose={tooltipHandlers.close} />}
    </div>
  );
};
```

### 4.3 Contrato visual

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (routing, TanStack Query, Zustand)         │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (useState UI, useEffect, refs)     │   │
│   │                                      │   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │ Toolbar  │  │  FilterChips     │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   │  ┌──────────────────────────────────┐│   │
│   │  │           Grid                   ││   │
│   │  └──────────────────────────────────┘│   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │ Tooltip  │  │     Popup        │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 5. Capa API del pod

Cada pod tiene una carpeta `api/` con tres archivos:

```
api/
├── index.ts               ← Barrel
├── calendar.api-model.ts  ← Tipos crudos de la API (lo que devuelve el servidor)
└── calendar.api.ts        ← Hooks TanStack Query (useQuery / useMutation)
```

### `calendar.api-model.ts` — tipos crudos

```ts
export interface CalendarEventApiModel {
  id: string;
  title: string;
  start_date: string; // ISO string — snake_case como viene del servidor
  end_date: string;
  created_at: string;
}
```

### `calendar.api.ts` — hooks TanStack Query

```ts
export const useCalendarEvents = (params: { month: number; year: number }) => {
  return useQuery({
    queryKey: ["calendar", "events", params],
    queryFn: () => apiClient.get<CalendarEventApiModel[]>("/calendar/events", { params }),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventPayload) => apiClient.post("/calendar/events", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar", "events"] }),
  });
};
```

### `calendar.mapper.ts` — API response → ViewModel

```ts
import { CalendarEventApiModel } from "./api/calendar.api-model";
import { CalendarEventVM } from "./calendar.types";

export const mapCalendarEvent = (raw: CalendarEventApiModel): CalendarEventVM => ({
  id: raw.id,
  title: raw.title,
  startDate: new Date(raw.start_date),
  endDate: new Date(raw.end_date),
});
```

### `calendar.types.ts` — ViewModel

```ts
export interface CalendarEventVM {
  id: string;
  title: string;
  startDate: Date; // camelCase — adaptado a la UI
  endDate: Date;
}
```

---

## 6. Hooks del pod

Los hooks de UI se ubican en `hooks/` dentro del pod.

### Naming

- Archivos: `camelCase.ts` → `useCalendarFilters.ts`
- Export: `camelCase` → `useCalendarFilters`
- Barrel obligatorio: `hooks/index.ts` re-exporta todo

### Patrón de retorno — tupla `[State, Handlers]`

```ts
export const useCalendarFilters = (): [CalendarFiltersState, CalendarFiltersHandlers] => {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const resetFilters = () => {
    setTypeFilter(null);
    setShowCompleted(false);
  };

  return [
    { typeFilter, showCompleted },
    { setTypeFilter, toggleCompleted: () => setShowCompleted((v) => !v), resetFilters },
  ];
};
```

### ¿Cuándo crear un hook del pod?

- Cuando un grupo de `useState` + handlers están cohesionados (filtros, tooltips, paginación)
- Cuando el component tiene más de ~5 `useState` → señal de que hay hooks por extraer
- Cuando la lógica se puede nombrar con un sustantivo claro (`filters`, `tooltip`, `dates`)

---

## 7. Hooks globales

Los hooks reutilizables entre pods viven en `src/core/hooks/` o `src/common/hooks/`:

```ts
// useClickOutside.ts
export const useClickOutside = (ref: RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};
```

---

## 8. Naming conventions

| Elemento        | Convención                   | Ejemplo                 |
| --------------- | ---------------------------- | ----------------------- |
| Container       | `PascalCase + Container.tsx` | `CalendarContainer.tsx` |
| Component       | `PascalCase + Component.tsx` | `CalendarComponent.tsx` |
| Sub-componentes | `PascalCase.tsx`             | `CalendarGrid.tsx`      |
| Hooks del pod   | `camelCase.ts`               | `useCalendarFilters.ts` |
| Hooks globales  | `camelCase.ts`               | `useClickOutside.ts`    |
| API model       | `camelCase.api-model.ts`     | `calendar.api-model.ts` |
| API hooks       | `camelCase.api.ts`           | `calendar.api.ts`       |
| Mapper          | `camelCase.mapper.ts`        | `calendar.mapper.ts`    |
| ViewModel types | `camelCase.types.ts`         | `calendar.types.ts`     |
| Styles          | `camelCase.styles.ts`        | `calendar.styles.ts`    |
| Barrels         | `index.ts`                   | `hooks/index.ts`        |

---

## 9. Principios clave

**Aislamiento** — Cada pod funciona de forma independiente. Un bug en `flashcards` no toca `pronunciation`.

**Cohesión** — Todo lo relacionado a una feature vive dentro del pod.

**Bajo acoplamiento** — Un pod NO importa de otro pod. Comunicación solo a través de `core`, `common`, o `common-app`.

**No sobre-arquitecturar** — Si un pod tiene un solo component sin hooks ni sub-componentes, no hace falta crear `hooks/` ni `components/`. La estructura crece con la complejidad.

---

## 10. Rutas autenticadas (`AppShell`)

| Ruta | Pod / vista | Notas |
| ---- | ----------- | ----- |
| `/home` | `containers/home` | Hub post-login; cards por rol |
| `/profile` | `containers/profile` | Cuenta, ranking (user), preferencias |
| `/stats` | `containers/stats` | Progreso del jugador |
| `/ranking` | `containers/ranking` | Leaderboard |
| `/backoffice/*` | backoffice | teacher / admin |

Post-login por defecto: `/home` (ver `core/navigation/sessionNav.ts`).

---

## 11. Flujo de datos

```
API → api.ts (TanStack Query) → mapper → ViewModel → Container → Component
                                                          ↑              ↓
                                                   mutations/callbacks  Sub-componentes
```
