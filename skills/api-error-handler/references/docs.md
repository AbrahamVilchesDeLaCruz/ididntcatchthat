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
  "error": {
    "code": "flashcard_not_found",
    "message": "Flashcard with id abc123 does not exist",
    "status": 404
  },
  "meta": {
    "timestamp": "2026-05-21T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

Este formato lo genera `HttpExceptionFilter` automáticamente — no construirlo manualmente en controllers.
