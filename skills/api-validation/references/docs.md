# api-validation — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-infrastructure` | Dónde viven los Payloads y Queries (carpeta controllers/) |
| `api-response` | Formato de error de validación en la respuesta |
| `api-error-handler` | `ValidationErrorResponse` — clase usada en `@ApiUnprocessableEntityResponse` |
| `api-rest` | Qué método HTTP usa cada tipo de operación |

## External Documentation

- [class-validator — GitHub](https://github.com/typestack/class-validator#readme) — lista completa de decorators
- [class-transformer — GitHub](https://github.com/typestack/class-transformer) — `@Type()`, `@Transform()`, `@Exclude()`
- [NestJS — Validation](https://docs.nestjs.com/techniques/validation) — `ValidationPipe`, `whitelist`, `forbidNonWhitelisted`
- [NestJS Swagger — @nestjs/swagger](https://docs.nestjs.com/openapi/introduction) — `@ApiProperty`, `@ApiPropertyOptional`

## ValidationPipe global config

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,               // strip unknown properties
    forbidNonWhitelisted: true,    // throw on unknown properties
    transform: true,               // auto-transform (needed for @Type())
    transformOptions: {
      enableImplicitConversion: false, // require explicit @Type() — safer
    },
  }),
);
```
