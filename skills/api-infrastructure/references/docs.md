# api-infrastructure — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain` | Aggregates y Value Objects que los repositorios mapean |
| `api-criteria` | Cómo aplicar `Criteria` en el `match()` del repositorio |
| `api-di` | Cómo registrar el repositorio y los controllers en el módulo |
| `api-validation` | Payloads y Queries — DTOs de entrada en los controllers |
| `api-response` | `ApiResponse`, `PaginatedApiResponse`, `resolveRequestId` |
| `api-error-handler` | `ExceptionRegistry` — cómo registrar errores en el módulo |
| `api-auth` | Guards y `@CurrentUser` en controllers |

## External Documentation

- [NestJS — Controllers](https://docs.nestjs.com/controllers) — routing, params, body, response
- [NestJS — Modules](https://docs.nestjs.com/modules) — `forFeature`, `imports`, `exports`
- [TypeORM — Repository](https://typeorm.io/repository-api) — `createQueryBuilder`, `save`, `delete`
- [TypeORM — QueryBuilder](https://typeorm.io/select-query-builder) — `andWhere`, `orderBy`, `take`, `skip`
- [NestJS Swagger — @nestjs/swagger](https://docs.nestjs.com/openapi/introduction) — decoradores de documentación

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [backend-architecture.md](../../../docs/backend-architecture.md) | Qué responsabilidades tiene la capa Infrastructure y qué NO puede hacer |
| [domain/db-schema.md](../../../docs/domain/db-schema.md) | Esquema real de la DB — tablas, columnas, relaciones que las TypeORM Entities deben mapear |
| [adr/002-nestjs-typeorm.md](../../../docs/adr/002-nestjs-typeorm.md) | Decisión: NestJS + TypeORM como stack de infrastructure |
| [adr/022-swagger-openapi.md](../../../docs/adr/022-swagger-openapi.md) | Decisión: Swagger obligatorio en todos los endpoints |
