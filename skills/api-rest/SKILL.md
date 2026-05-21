---
name: api-rest
description: >
  Convenciones RESTful de la API: rutas, métodos HTTP, status codes y acciones DDD con POST.
  Trigger: Al diseñar o implementar endpoints en apps/api/.
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

| Situación                                     | Status                     |
| --------------------------------------------- | -------------------------- |
| GET exitoso con resultado                     | `200 OK`                   |
| GET exitoso sin resultado (lista vacía)       | `200 OK` con `[]`          |
| POST creación exitosa                         | `201 CREATED`              |
| PATCH / acción exitosa sin body               | `204 NO CONTENT`           |
| PATCH / acción exitosa con body               | `200 OK`                   |
| Recurso no encontrado                         | `404 NOT FOUND`            |
| Validación fallida (campo inválido)           | `422 UNPROCESSABLE ENTITY` |
| Conflicto de estado                           | `409 CONFLICT`             |
| No autorizado (sin token)                     | `401 UNAUTHORIZED`         |
| Sin permisos (token válido, acción prohibida) | `403 FORBIDDEN`            |

### Acciones DDD con POST

Cuando una acción de dominio no es CRUD puro — tiene semántica propia — se modela como sub-recurso con POST.

```
POST /flashcards/:id/review          ← revisar una flashcard (spaced repetition)
POST /flashcards/:id/archive         ← archivar
POST /games/:id/start                ← iniciar partida
POST /games/:id/answer               ← registrar respuesta
POST /pronunciation-sessions/:id/end ← finalizar sesión
```

**Cuándo usar acción DDD vs PATCH:**

| Criterio                                                            | Usar PATCH | Usar POST /{acción} |
| ------------------------------------------------------------------- | ---------- | ------------------- |
| Cambio de datos simples                                             | ✅         |                     |
| Transición de estado con reglas de negocio                          |            | ✅                  |
| La acción tiene nombre en el dominio (`review`, `archive`, `start`) |            | ✅                  |
| Idempotente                                                         | ✅         | depende             |

```typescript
// ✅ Acción DDD — tiene semántica propia en el dominio
@Post(':id/review')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(
  @Param('id') id: string,
  @Body() body: ReviewFlashcardDto,
): Promise<void> {
  await this.reviewer.execute(id, body.quality);
}

// ❌ Verbo en la ruta
@Post(':id/doReview')
@Post('review/:id')
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
