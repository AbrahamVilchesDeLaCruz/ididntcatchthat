# api-rest — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-infrastructure` | Controllers — implementación de los endpoints |
| `api-validation` | Payloads y Queries — validación de entrada |
| `api-response` | Formatos de respuesta por método HTTP |
| `api-error-handler` | Errores HTTP y su mapping a domain errors |

## External Documentation

- [HTTP Methods — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) — semántica de GET, POST, PATCH, PUT, DELETE
- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — referencia completa
- [RESTful API Design — Best Practices](https://restfulapi.net/) — convenciones de naming y recursos
- [NestJS — Controllers](https://docs.nestjs.com/controllers) — routing, params, body decorators
- [OpenAPI 3.0 — Specification](https://swagger.io/specification/) — documentación de APIs REST

## Route naming in this project

```
GET    /resources          → list/search (con query params)
GET    /resources/:id      → get one
POST   /resources          → create
PATCH  /resources/:id      → partial update
DELETE /resources/:id      → delete

# DDD Actions — verbs as sub-resources via POST
POST   /resources/:id/complete   → GameCompleter
POST   /resources/:id/abandon    → GameAbandonner
POST   /resources/:id/pause      → GamePauser
```

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [backend-architecture.md](../../../docs/backend-architecture.md) | Controllers en Infrastructure — sin lógica, solo orquestar request→use case→response |
| [adr/022-swagger-openapi.md](../../../docs/adr/022-swagger-openapi.md) | Decisión: Swagger obligatorio en todos los endpoints del proyecto |
| [domain/bounded-contexts.md](../../../docs/domain/bounded-contexts.md) | Qué endpoints expone cada BC — contexto de cada ruta |
