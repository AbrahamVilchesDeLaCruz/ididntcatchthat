# api-response — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-infrastructure` | Controllers — dónde se usa `ApiResponse.of()` |
| `api-validation` | Query DTOs — de donde vienen `page` y `limit` para `PaginationMeta` |
| `api-error-handler` | Formato de respuesta de error — distinto al envelope exitoso |
| `api-criteria` | Paginación construida en el use case, totals devueltos al controller |

## External Documentation

- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — referencia completa
- [REST API Design — Pagination](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/) — convenciones de paginación
- [NestJS — Response](https://docs.nestjs.com/controllers#response) — `@HttpCode`, `@Header`, `Res`

## CQRS Inspiration

El patrón de respuesta sigue el principio CQRS (Command Query Responsibility Segregation):
- **Queries** (GET) → siempre retornan datos — usan el envelope `ApiResponse<T>`
- **Commands** (PATCH, DELETE, acciones POST) → retornan solo el resultado de la operación — `void` + status code

Esto hace que el API sea predecible: si el endpoint es GET, siempre hay un `data` field.

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [backend-architecture.md](../../../docs/backend-architecture.md) | Envelopes en Infrastructure — los use cases devuelven primitivos, los controllers envuelven |
| [adr/022-swagger-openapi.md](../../../docs/adr/022-swagger-openapi.md) | Swagger — documentación de responses en todos los endpoints |
