# client-container-presentational

El patrón central del cliente. Cada pod tiene dos piezas obligatorias: **Container** y **Component**.

> Referencia completa: [docs/frontend-architecture.md](../../docs/frontend-architecture.md)

---

## Container (`*Container.tsx`)

La **puerta de entrada al mundo exterior** del pod.

### Responsabilidades exclusivas

- Data binding: `useQuery` / `useMutation` de TanStack Query
- Routing: `useParams`, `useLocation`, `useNavigate`, `useSearchParams`
- Contexto global: Zustand store, `useContext`
- Callbacks que disparan mutations o navegación
- `useMemo` para derivar parámetros de query (nunca `useState` para valores derivados)

### Prohibiciones

- ❌ `useState` de UI (modals, tooltips, filtros visuales)
- ❌ JSX complejo — solo renderiza `<{Feature}Component />` con props
- ❌ `useEffect` salvo sync trivial hacia afuera
- ❌ Transformaciones de datos (eso es el mapper)

### Ejemplo

```tsx
// FlashcardsContainer.tsx
export const FlashcardsContainer = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [page, setPage] = useState(1);

  // TanStack Query — data binding
  const { data: flashcards, isLoading } = useFlashcards({ deckId, page });
  const { mutate: deleteFlashcard } = useDeleteFlashcard();

  // Callback que dispara mutation
  const handleDelete = (id: string) => deleteFlashcard({ id });

  return (
    <FlashcardsComponent
      flashcards={flashcards ?? []}
      isLoading={isLoading}
      onDelete={handleDelete}
      onPageChange={setPage}
    />
  );
};
```

---

## Component (`*Component.tsx`)

El **dueño de la UI**: estado visual, ciclo de vida, composición.

### Responsabilidades

- Estado de UI: `useState` para modals, tooltips, filtros, toggles
- `useEffect` para sincronizar estado de UI local
- `useRef` para componentes de terceros, scroll, focus
- Composición: renderiza sub-componentes de `components/`
- Consume hooks del pod (`hooks/`) para encapsular lógica de UI compleja

### Prohibiciones

- ❌ `useQuery` / `useMutation` — no hace fetch de datos
- ❌ `useParams`, `useNavigate`, `useLocation` — no accede a routing
- ❌ Zustand store ni `useContext` global
- ❌ Lógica de negocio — solo presentación y estado de UI

### Props interface

Siempre declarar una interface explícita para las props del Component:

```tsx
interface FlashcardsComponentProps {
  flashcards: FlashcardVM[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}
```

### Ejemplo

```tsx
// FlashcardsComponent.tsx
export const FlashcardsComponent = ({
  flashcards,
  isLoading,
  onDelete,
  onPageChange,
}: FlashcardsComponentProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, filterHandlers] = useFlashcardFilters();

  return (
    <div>
      <FlashcardToolbar filters={filters} onFilter={filterHandlers.setDifficulty} />
      <FlashcardGrid
        flashcards={flashcards}
        isLoading={isLoading}
        onSelect={setSelectedId}
        onDelete={onDelete}
      />
      {selectedId && (
        <FlashcardDetailPopup
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};
```

---

## Contrato visual

```
┌─────────────────────────────────────────────┐
│               Container                      │
│  (useQuery, useMutation, useParams,         │
│   Zustand, callbacks)                       │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │           Component                  │   │
│   │  (useState UI, useEffect, useRef,   │   │
│   │   hooks del pod)                    │   │
│   │                                      │   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │ Toolbar  │  │  FilterChips     │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   │  ┌──────────────────────────────────┐│   │
│   │  │           Grid                   ││   │
│   │  └──────────────────────────────────┘│   │
│   │  ┌──────────┐  ┌──────────────────┐ │   │
│   │  │  Popup   │  │    Tooltip       │ │   │
│   │  └──────────┘  └──────────────────┘ │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Flujo de callbacks

El Component nunca sabe cómo se ejecuta una acción — solo recibe callbacks:

```
Container                          Component
─────────                          ─────────
handleDelete = (id) =>             onDelete(id)  ← prop
  deleteFlashcard({ id })          ↑
                                   llama al callback
                            mutation ejecutada en Container
```

---

## Tamaño esperado

| Archivo | Líneas aprox. |
|---|---|
| Container | ~40–80 líneas |
| Component | ~80–150 líneas |

Si el Container supera 80 líneas, probablemente tiene lógica de UI que no le corresponde.
Si el Component supera 150 líneas, probablemente hay hooks del pod por extraer.
