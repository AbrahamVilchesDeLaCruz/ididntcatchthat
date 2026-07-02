---
name: api-infrastructure
description: "Convenciones de la capa Infrastructure en la API: Controllers, TypeORM entities, repositorios y módulos NestJS. Trigger: Al crear o modificar controllers, entidades TypeORM, repositorios o módulos en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear o modificar un controller
- Al crear una TypeORM entity o repositorio
- Al crear o modificar un módulo NestJS

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/controller-patterns.md` cuando necesites el patrón completo de Swagger, Payloads o Query GET.
> Lee `references/repository-patterns.md` cuando necesites la implementación completa de TypeORM con Criteria o el módulo NestJS.

## Controllers — Naming y Reglas

Un controller por acción. Nombre: `{Verb}{Entity}{Method}Controller`. Método siempre `handler()`.

**Naming:**
- Archivo: `{verb}-{resource}-{method}.controller.ts` — `start-game-post.controller.ts`
- Clase: `{Verb}{Resource}{Method}Controller` — `StartGamePostController`
- Payload (POST/PATCH body): `{Verb}{Resource}{Method}Payload`
- Query (GET params): `{Verb}{Resource}{Method}Query`

**Reglas del controller:**
- Un controller = un caso de uso = una responsabilidad
- Sin lógica — recibe HTTP, construye el `Request*`, delega al use case, devuelve respuesta
- Swagger obligatorio: `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, respuestas con status codes
- Commands con datos (POST que crea) → `ApiResponse<T>` + `201`
- Commands puros (PATCH/DELETE) → `void` + `204`
- Queries (GET) → `ApiResponse<T>` o `PaginatedApiResponse<T>` + `200`
- `resolveRequestId(req)` en todos los endpoints que devuelven envelope

## Payloads y Queries — Reglas

- Solo en infrastructure — nunca pasan a application
- El controller construye el `Request*` del use case a partir del payload/query
- `@IsOptional()` para campos opcionales
- `@Type(() => Number)` en Query únicamente para `page`, `limit` (strings en HTTP)
- `@ApiProperty` / `@ApiPropertyOptional` en todos los campos

## TypeORM Entities — Reglas

- Sufijo `Entity` — diferencia la entidad de domain
- Tabla en `snake_case` plural: `games`, `flashcards`
- Columnas: `snake_case` en DB, `camelCase` en código — usar `name` en `@Column`
- Solo en `infrastructure/persistence/` — nunca en domain ni application

## Repositorios TypeORM — Reglas

- Prefijo `TypeOrm` — deja claro la implementación concreta
- `toDomain()` y `toEntity()` privados — la TypeORM Entity nunca sale del repositorio
- `match()` SIEMPRE aplica todos los campos de `Criteria`: filters, order, limit, offset
- `value: null` + `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (nunca `= null` en SQL)

## Estructura de carpetas

```
infrastructure/
├── controllers/
│   ├── {verb}-{resource}-{method}.controller.ts
│   └── {verb}-{resource}-{method}.payload.ts
├── framework/        ← NestJS modules + exception registries
└── persistence/      ← TypeORM entities + repositories
```

## Anti-patterns

```typescript
// ❌ Un controller para todo el recurso
export class GameController { }

// ❌ Payload pasando a application
async execute(payload: StartGamePostPayload): Promise<void> {}

// ❌ match() que ignora Criteria
async match(criteria: Criteria): Promise<Game[]> {
  return this.repo.find(); // criteria ignorado
}

// ❌ TypeORM entity saliendo del repositorio
async search(id: GameId): Promise<GameEntity> { ... }

// ❌ Controller sin Swagger
@Post() async handler(@Body() body): Promise<void> {}
```
