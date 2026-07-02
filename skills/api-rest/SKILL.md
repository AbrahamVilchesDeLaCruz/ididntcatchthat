---
name: api-rest
description: "Convenciones RESTful de la API: rutas, métodos HTTP, status codes y acciones DDD con POST. Trigger: Al diseñar o implementar endpoints en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al diseñar rutas de un nuevo recurso
- Al elegir el método HTTP correcto para una acción
- Al decidir el status code de una respuesta
- Al modelar acciones de dominio que no encajan en CRUD puro

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

## Critical Patterns

### Rutas — convenciones base

```
GET    /flashcards              ← listar (con query params para filtros)
GET    /flashcards/:id          ← obtener uno
POST   /flashcards              ← crear
PATCH  /flashcards/:id          ← actualizar parcialmente
DELETE /flashcards/:id          ← eliminar
```

**Reglas:**

- Recursos en `kebab-case` plural: `/flashcards`, `/pronunciation-sessions`
- Sin verbos en la ruta: nunca `/flashcards/create` ni `/getFlashcard`
- Anidamiento máximo de 2 niveles: `/decks/:id/flashcards` — si necesitás más, replantear
- IDs siempre en el path, nunca en el body para GET/DELETE

### Status codes

| Situación                                            | Status                     |
| ---------------------------------------------------- | -------------------------- |
| GET exitoso con resultado                            | `200 OK`                   |
| GET exitoso sin resultado (lista vacía)              | `200 OK` con `[]`          |
| POST creación de recurso exitosa                     | `201 CREATED`              |
| PATCH / POST acción DDD exitosa sin body             | `204 NO CONTENT`           |
| PATCH / POST acción DDD exitosa con body             | `200 OK`                   |
| Recurso no encontrado                                | `404 NOT FOUND`            |
| Validación fallida (campo inválido)                  | `422 UNPROCESSABLE ENTITY` |
| Conflicto de estado                                  | `409 CONFLICT`             |
| No autorizado (sin token)                            | `401 UNAUTHORIZED`         |
| Sin permisos (token válido, acción prohibida)        | `403 FORBIDDEN`            |

> Las acciones DDD con POST (`/games/:id/complete`, `/games/:id/resume`) usan `200 OK` si devuelven body o `204 NO CONTENT` si no. Nunca `201` — ese código es exclusivo de creaciones de recurso.

### Acciones DDD con POST

Cuando una acción de dominio no es CRUD puro — tiene semántica propia — se modela como sub-recurso con POST.

```
POST /flashcards/:id/review          ← revisar una flashcard (spaced repetition)
POST /flashcards/:id/archive         ← archivar
POST /games/:id/complete             ← completar partida (devuelve stats)
POST /games/:id/resume               ← reanudar partida pausada (devuelve estado)
POST /games/:id/attempts             ← registrar intento (sin body de respuesta)
POST /pronunciation-sessions/:id/end ← finalizar sesión
```

> `POST /games` (sin `:id`) es creación de recurso → devuelve `201 CREATED`. Las acciones DDD van siempre sobre un recurso existente: `/games/:id/{acción}`.

**Cuándo usar acción DDD vs PATCH:**

| Criterio                                                            | Usar PATCH | Usar POST /{acción} |
| ------------------------------------------------------------------- | ---------- | ------------------- |
| Cambio de datos simples                                             | ✅         |                     |
| Transición de estado con reglas de negocio                          |            | ✅                  |
| La acción tiene nombre en el dominio (`review`, `archive`, `start`) |            | ✅                  |
| Idempotente                                                         | ✅         | depende             |

```typescript
// ✅ Acción DDD sin body de respuesta → 204
@Post(':id/attempts')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(
  @Param('id') id: string,
  @Body() body: RecordAttemptPostPayload,
  @CurrentUser() user: UserContext,
): Promise<void> {
  await this.recorder.execute({
    gameId: id,
    flashcardId: body.flashcardId,
    correct: body.correct,
    userId: user.userId ?? null,
  });
}

// ✅ Acción DDD con body de respuesta → 200
@Post(':id/complete')
@HttpCode(HttpStatus.OK)
async handler(
  @Param('id') id: string,
  @CurrentUser() user: UserContext,
): Promise<ApiResponse<ResponseGameCompleter>> {
  const data = await this.completer.execute({ gameId: id, userId: user.userId ?? null });
  return ApiResponse.of(data, resolveRequestId(req));
}

// ❌ Verbo en la ruta
@Post(':id/doReview')
@Post('review/:id')
```

### Swagger — decoradores obligatorios

Todo endpoint debe estar documentado con Swagger (ADR 022). Los decoradores se aplican en dos niveles:

**A nivel de clase:**

```typescript
@ApiTags('gaming')               // ← nombre del bounded context / recurso
@ApiBearerAuth('access-token')   // ← si el endpoint requiere JWT (omitir en endpoints públicos)
@Controller('games')
@UseGuards(JwtAuthGuard)
export class CompleteGamePostController { ... }
```

**A nivel de método:**

```typescript
@Post(':id/complete')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Complete a game session',
  description: 'Marks the game as completed and returns summary stats.',
})
@ApiOkResponse({ description: 'Game completed with summary stats' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiUnprocessableEntityResponse({
  description: 'Validation error',
  type: ValidationErrorResponse,
})
async handler(...) { ... }
```

**Decoradores de respuesta por status code:**

| Status | Decorador Swagger |
| ------ | ----------------- |
| `200`  | `@ApiOkResponse({ description: '...' })` |
| `201`  | `@ApiCreatedResponse({ description: '...' })` |
| `204`  | (ninguno — 204 no lleva body ni decorador de respuesta exitosa) |
| `401`  | `@ApiUnauthorizedResponse({ description: '...' })` |
| `403`  | `@ApiForbiddenResponse({ description: '...' })` |
| `404`  | `@ApiNotFoundResponse({ description: '...' })` |
| `409`  | `@ApiConflictResponse({ description: '...' })` |
| `422`  | `@ApiUnprocessableEntityResponse({ description: '...', type: ValidationErrorResponse })` |

> Incluir solo los status codes que el endpoint puede devolver realmente — no añadir decoradores genéricos que no apliquen.

### Naming del método de acción

El método de acción siempre se llama `handler`:

```typescript
async handler(
  @Param('id') id: string,
  @Body() body: RecordAttemptPostPayload,
  @CurrentUser() user: UserContext,
): Promise<void> { ... }
```

### Un controller por acción

Cada acción HTTP es un controller independiente. Ver skill `api-infrastructure` para naming y payloads.

```
flashcards/infrastructure/controllers/
├── create-flashcard-post.controller.ts       + create-flashcard-post.payload.ts
├── search-flashcards-get.controller.ts       + search-flashcards-get.query.ts
├── find-flashcard-get.controller.ts
├── update-flashcard-patch.controller.ts      + update-flashcard-patch.payload.ts
├── delete-flashcard-delete.controller.ts
└── review-flashcard-post.controller.ts       + review-flashcard-post.payload.ts
```

Todos los controllers del recurso se registran en el módulo:

```typescript
@Module({
  controllers: [
    CreateFlashcardPostController,
    SearchFlashcardsGetController,
    FindFlashcardGetController,
    UpdateFlashcardPatchController,
    DeleteFlashcardDeleteController,
    ReviewFlashcardPostController,
  ],
})
export class FlashcardModule {}
```

### Request/Response bodies

- **Request**: validado con `class-validator` + DTO solo en el controller (no pasa a application)
- **Response**: primitivos planos — nunca entidades de dominio
- **snake_case** en JSON de respuesta cuando es convención del equipo — decidir y ser consistente

### Query params para listados

```
GET /flashcards?orderBy=createdAt&orderType=DESC&limit=20&offset=0
GET /flashcards?filters[0][field]=front&filters[0][operator]=CONTAINS&filters[0][value]=hello
```

El controller extrae y pasa a use case como primitivos — ver skill `api-criteria`.

## Anti-patterns

```typescript
// ❌ Un controller para todo el recurso
export class FlashcardController { } // un controller por acción

// ❌ DTO genérico sin nombre semántico
export class FlashcardDto { }        // CreateFlashcardPostPayload / SearchFlashcardsGetQuery

// ❌ Verbo en la ruta
GET  /flashcards/getAll
POST /flashcards/create
POST /flashcards/doReview/:id

// ❌ ID en body para GET
GET /flashcards  body: { id: '123' }

// ❌ 200 para creación
@Post() @HttpCode(HttpStatus.OK)  // debe ser 201

// ❌ Devolver entidad de dominio
return flashcard; // devolver flashcard.toPrimitives()

// ❌ Lógica de negocio en controller
if (body.quality > 5) throw new BadRequestException(); // va en VO o dominio
```
