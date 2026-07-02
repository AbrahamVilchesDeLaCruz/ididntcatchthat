# client-pods — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `client-container-presentational` | Contrato Container/Component — responsabilidades y prohibiciones |
| `client-api` | Capa api/: api-model, api.ts, mapper |
| `client-query` | TanStack Query hooks dentro de api.ts |
| `client-hooks` | Cuándo y cómo extraer hooks del Container |
| `client-testing` | Cómo testear el Component y el Container |

## External Documentation

- [React — File Structure](https://react.dev/learn/thinking-in-react) — React oficial sobre cómo organizar componentes
- [TanStack Query — Overview](https://tanstack.com/query/latest/docs/framework/react/overview) — conceptos base de fetching
- [Vite — Path Aliases](https://vitejs.dev/config/resolve-resolve-alias) — configuración de `@/` alias

## Decision: Por qué pods en lugar de feature folders

Los pods colocan todo lo relacionado a una feature en un único directorio, incluyendo la capa de datos (api/). Esto reduce el número de archivos a buscar cuando se trabaja en una feature y hace más obvio qué puede eliminarse cuando una feature desaparece.

La alternativa (separar por tipo: `components/`, `hooks/`, `services/`) dispersa el código relacionado y dificulta el razonamiento sobre qué pertenece a qué feature.
