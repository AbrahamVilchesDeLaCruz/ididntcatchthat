# api-error-handler — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-domain` | Domain Errors — cómo se definen con `DomainError` base class |
| `api-infrastructure` | Dónde registrar el `ExceptionRegistry` en el módulo NestJS |
| `api-response` | Formato de respuesta de error vs respuesta exitosa |
| `api-shared` | `GlobalExceptionRegistry` vive en SharedModule |

## External Documentation

- [NestJS — Exception Filters](https://docs.nestjs.com/exception-filters) — `@Catch()`, `ArgumentsHost`, `HttpException`
- [NestJS — Built-in Exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions) — `NotFoundException`, `ConflictException`, etc.
- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — referencia completa de status codes

## Error Response Envelope

```json
{
  "statusCode": 404,
  "message": "Game with id <abc123> not found",
  "errorType": "GameNotFound",
  "path": "/api/games/abc123",
  "timestamp": "2026-05-21T12:00:00.000Z"
}
```

Este formato lo genera `HttpExceptionFilter` automáticamente — no construirlo manualmente en controllers.

- `statusCode`: HTTP status code numérico
- `message`: mensaje del error (string del domain error, o response body si es `HttpException`)
- `errorType`: nombre de la clase de la excepción (solo para errores de dominio; `null` para `HttpException`)
- `path`: URL de la request
- `timestamp`: ISO 8601

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [backend-architecture.md](../../../docs/backend-architecture.md) | Los errores de dominio se lanzan en Domain, se mapean a HTTP en Infrastructure |
| [engineering-principles.md](../../../docs/engineering-principles.md) | SRP — el mapping DomainError→HTTP es una responsabilidad exclusiva del filter |
