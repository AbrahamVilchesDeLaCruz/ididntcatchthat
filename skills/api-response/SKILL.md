---
name: api-response
description: >
  Envelope de respuesta, paginación, commands sin body en apps/api/.
  Trigger: Al definir el formato de respuesta de un endpoint, implementar paginación, o respuestas de commands.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

# Skill: api-response

## When to Use

- Al definir el formato de respuesta de un endpoint de lectura (queries)
- Al definir la respuesta de endpoints que modifican estado (commands)
- Al implementar el response envelope en controllers

---

## Principles

Este proyecto sigue una separación estricta inspirada en CQRS:

| Tipo | Respuesta | Cuándo |
|---|---|---|
| **Query** (GET, búsquedas) | Envelope con `data` + `pagination` opcional | Siempre que devuelva datos |
| **Command** (POST/PUT/PATCH/DELETE que modifican estado) | Solo status code HTTP | Siempre |

---

## Query Response — Envelope

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-21T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

Con paginación (solo cuando el endpoint pagina):

```json
{
  "data": [
    {
      "id": "uuid-1",
      "phrase": "I didn't catch that",
      "created_at": "2026-05-21T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 125,
    "total_pages": 13,
    "has_next_page": true,
    "has_prev_page": false
  },
  "meta": {
    "timestamp": "2026-05-21T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Reglas del envelope:**
- Sin campo `success` — el status HTTP lo expresa
- Sin campo `message` — los errores tienen su propio formato (HttpExceptionFilter)
- `pagination` solo aparece si el endpoint pagina — no en respuestas de un único recurso
- `meta.request_id` se propaga desde el header `X-Request-Id` (o se genera en el filter)

---

## Response Classes

```typescript
// src/shared/infrastructure/http/response/api-response.ts
export class ApiResponse<T> {
  constructor(
    readonly data: T,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(data: T, requestId: string): ApiResponse<T> {
    return new ApiResponse(data, {
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }
}

export class PaginatedApiResponse<T> {
  constructor(
    readonly data: T[],
    readonly pagination: PaginationMeta,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(
    data: T[],
    pagination: PaginationMeta,
    requestId: string,
  ): PaginatedApiResponse<T> {
    return new PaginatedApiResponse(data, pagination, {
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }
}

export interface ResponseMeta {
  timestamp: string;
  request_id: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}
```

---

## Controller Usage

### Query — respuesta con datos

```typescript
@Get()
async handler(
  @Query() query: SearchFlashcardsGetQuery,
  @Req() req: Request,
): Promise<PaginatedApiResponse<FlashcardResponse>> {
  const result = await this.useCase.execute({ ... });

  return PaginatedApiResponse.of(
    result.flashcards,
    {
      page: result.page,
      limit: result.limit,
      total_items: result.total,
      total_pages: Math.ceil(result.total / result.limit),
      has_next_page: result.page * result.limit < result.total,
      has_prev_page: result.page > 1,
    },
    req.headers['x-request-id'] as string ?? crypto.randomUUID(),
  );
}
```

### Command — solo status code

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
async handler(@Body() payload: CreateFlashcardPostPayload): Promise<void> {
  await this.useCase.execute({ ... });
  // sin return — NestJS envía 201 vacío
}

@Patch(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(@Param('id') id: string, @Body() payload: UpdateFlashcardPatchPayload): Promise<void> {
  await this.useCase.execute({ id, ...payload });
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(@Param('id') id: string): Promise<void> {
  await this.useCase.execute({ id });
}
```

---

## Status Codes

| Operación | Status |
|---|---|
| GET (recurso único) | `200 OK` |
| GET (colección) | `200 OK` |
| POST (crear recurso) | `201 Created` |
| POST (acción DDD) | `200 OK` |
| PATCH / PUT (actualizar) | `204 No Content` |
| DELETE | `204 No Content` |

---

## Rules

- Los endpoints de **comando** (mutación) devuelven **solo status code** — sin body
- Los endpoints de **query** (lectura) devuelven siempre el **envelope** con `data` y `meta`
- `pagination` solo si el endpoint acepta `page` y `limit` en la query
- Sin `success`, sin `message` en respuestas exitosas
- El `request_id` se lee del header `X-Request-Id` si viene del cliente, o se genera con `crypto.randomUUID()`

---

## Anti-patterns

```typescript
// ❌ Archivos .response.ts por controller — PROHIBIDO
// search-flashcards-get.response.ts  ← no crear
// find-flashcard-get.response.ts     ← no crear

// ✅ Correcto: el controller devuelve primitivos del dominio o un tipo inline
async handler(): Promise<ApiResponse<FlashcardPrimitives>> { ... }

// ✅ Si necesitás un tipo de respuesta nombrado, va en shared como interface genérica
// shared/infrastructure/http/response/api-response.ts  ← único lugar para tipos de respuesta
```
