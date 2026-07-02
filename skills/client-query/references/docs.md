# client-query — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `client-api` | Capa api/: api-model, mapper — lo que los hooks consumen |
| `client-container-presentational` | Cómo el Container usa los hooks |
| `client-hooks` | Cuándo extraer lógica de los hooks del Container |
| `client-testing` | Cómo testear Containers con queries usando MSW |

## External Documentation

- [TanStack Query v5 — Docs](https://tanstack.com/query/v5/docs/framework/react/overview) — guía completa
- [TanStack Query — Query Keys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys) — estrategia de keys
- [TanStack Query — Mutations](https://tanstack.com/query/v5/docs/framework/react/guides/mutations) — `useMutation`, `onSuccess`, `onError`
- [TanStack Query — Invalidation](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation) — cuándo y cómo invalidar

## Query Key Strategy

La estrategia de query keys de este proyecto usa arrays jerárquicos:

```
['{resource}']                    ← todos los recursos
['{resource}', 'list']            ← todas las listas
['{resource}', 'list', filters]   ← lista con filtros específicos
['{resource}', 'detail']          ← todos los detalles
['{resource}', 'detail', id]      ← detalle específico
```

Esto permite invalidar con distintos niveles de granularidad:
- `invalidateQueries({ queryKey: flashcardKeys.all })` → invalida todo
- `invalidateQueries({ queryKey: flashcardKeys.lists() })` → solo listas
- `invalidateQueries({ queryKey: flashcardKeys.detail(id) })` → solo ese id
