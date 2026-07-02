# client-hooks — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `client-container-presentational` | El Container es donde vive la lógica antes de extraerla |
| `client-query` | Hooks de TanStack Query que se usan en handlers |
| `client-pods` | Estructura del pod — dónde vive la carpeta `hooks/` |
| `client-testing` | Cómo testear hooks con `renderHook` y `act` |

## External Documentation

- [React — Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) — cuándo y cómo extraer
- [React — Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) — reglas que aplican en hooks personalizados
- [React — `useCallback`](https://react.dev/reference/react/useCallback) — cuándo memoizar handlers
- [React Testing Library — `renderHook`](https://testing-library.com/docs/react-testing-library/api/#renderhook) — cómo testear hooks

## State tuple vs. object return

Este proyecto usa el patrón tupla `[state, handlers]` (inspirado en `useState`) en lugar de un objeto plano `{ state, handlers }`. Las ventajas:

1. **Destructuring con rename**: `const [flashcardState, flashcardHandlers] = useFlashcardState()` — sin conflictos de nombres cuando el Container usa varios state hooks
2. **Convención clara**: `state` = solo lectura, `handlers` = solo escritura — la tupla enforce el contrato visualmente

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [frontend-architecture.md](../../../docs/frontend-architecture.md) | Cuándo extraer hooks en el contexto de la arquitectura del proyecto |
| [engineering-principles.md](../../../docs/engineering-principles.md) | SRP en el frontend — un hook = una responsabilidad |
