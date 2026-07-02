---
name: api-response
description: "Envelope de respuesta, paginación, commands sin body en apps/api/. Trigger: Al definir el formato de respuesta de un endpoint, implementar paginación, o respuestas de commands."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al definir el formato de respuesta de un endpoint de lectura (queries)
- Al definir la respuesta de endpoints que modifican estado (commands)
- Al implementar el response envelope en controllers

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/response-classes.md` para las implementaciones completas de `ApiResponse`, `PaginatedApiResponse`, `resolveRequestId` y ejemplos completos de controllers.

---

## Principios CQRS

| Tipo | Respuesta | Status |
|---|---|---|
| **Query** (GET) | `ApiResponse<T>` o `PaginatedApiResponse<T>` | `200` |
| **Command con datos** (POST que devuelve ID/datos) | `ApiResponse<T>` | `201` |
| **Command puro** (PATCH/DELETE/acciones) | `void` — solo status code | `204` |

---

## Formato del envelope

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-21T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

Con paginación:

```json
{
  "data": [...],
  "pagination": {
    "page": 1, "limit": 10,
    "total_items": 125, "total_pages": 13,
    "has_next_page": true, "has_prev_page": false
  },
  "meta": { "timestamp": "...", "request_id": "..." }
}
```

---

## Reglas del envelope

- Sin campo `success` — el status HTTP lo expresa
- Sin campo `message` — los errores tienen su propio formato (ver `api-error-handler`)
- `pagination` solo si el endpoint acepta `page` y `limit`
- `meta.request_id` siempre vía `resolveRequestId(req)` — nunca inline

---

## Status Codes

| Operación | Status |
|---|---|
| GET (único o colección) | `200 OK` |
| POST (crear con respuesta) | `201 Created` + `ApiResponse<T>` |
| POST (acción DDD sin respuesta) | `204 No Content` |
| PATCH / PUT | `204 No Content` |
| DELETE | `204 No Content` |

---

## Anti-patterns

```typescript
// ❌ Archivos .response.ts por controller — PROHIBIDO
// search-games-get.response.ts

// ❌ resolveRequestId inline en el controller
return ApiResponse.of(data, req.headers['x-request-id'] as string ?? crypto.randomUUID());

// ❌ Envelope en commands puros
@Patch(':id')
async handler(): Promise<{ success: true }> { ... }

// ❌ Sin resolveRequestId
return ApiResponse.of(data, 'hardcoded-id');
```
