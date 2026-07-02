# client-container-presentational — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `client-pods` | Dónde vive el Container y el Component dentro del pod |
| `client-query` | Hooks de TanStack Query que el Container usa |
| `client-hooks` | Cuándo extraer lógica del Container a hooks |
| `client-testing` | Component se testea con RTL + props; Container con RTL + MSW |

## External Documentation

- [React — Thinking in React](https://react.dev/learn/thinking-in-react) — filosofía de separación UI/datos
- [Dan Abramov — Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) — el artículo original (2015)
- [TanStack Query — Dependent Queries](https://tanstack.com/query/v5/docs/framework/react/guides/dependent-queries) — cuando una query depende del resultado de otra

## Decision: Container/Component vs. hooks everywhere

Con TanStack Query es tentador poner `useQuery` directamente en cualquier componente. El patrón Container/Component añade una separación explícita que:
1. Hace el Component testeale con props mockeadas (sin necesidad de MSW)
2. Aísla la responsabilidad de fetching — más fácil de razonar
3. Permite cambiar la estrategia de fetching sin tocar la UI
