# client-api — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `client-pods` | Estructura del pod — dónde vive la capa api/ |
| `client-query` | Hooks TanStack Query que consumen las funciones de api.ts |
| `client-container-presentational` | Container que usa las queries y pasa ViewModels al Component |
| `client-testing` | Cómo testear mappers (unit) y Containers con MSW (integration) |

## External Documentation

- [TanStack Query — Queries](https://tanstack.com/query/v5/docs/framework/react/guides/queries) — `useQuery` básico
- [Axios — Docs](https://axios-http.com/docs/intro) — si el proyecto usa Axios como cliente HTTP
- [Fetch API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) — alternativa nativa

## Pattern: Por qué separar ApiModel y ViewModel

**ApiModel** captura exactamente lo que devuelve el backend (snake_case, strings para fechas). Cuando el backend cambia, solo se actualiza el mapper.

**ViewModel** es lo que los componentes consumen. Es estable aunque el backend cambie su naming o estructura. Los tests de componente usan ViewModels directamente (via Object Mothers), no datos crudos de la API.

Este patrón permite:
1. Cambiar el backend sin tocar los tests de componente
2. Testear el mapper en aislamiento (función pura)
3. Razonar sobre el estado de la UI sin conocer los detalles de la API

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [frontend-architecture.md](../../../docs/frontend-architecture.md) | Cómo la capa api/ encaja en la arquitectura de pods |
| [client-pods.md](../../../docs/client-pods.md) | Endpoints reales que cada pod consume — qué devuelve la API para cada pod |
