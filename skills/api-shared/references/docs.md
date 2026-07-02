# api-shared — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-di` | Cómo usar los tokens que expone SharedModule (`LOGGER_SERVICE`, `EVENT_BUS`, etc.) |
| `api-infrastructure` | Módulos de cada BC — se importan en `AppModule` junto con `SharedModule` |
| `api-criteria` | `Criteria` vive en `shared/domain/` |
| `api-observability` | `PinoLogger` se registra en `SharedModule` |

## External Documentation

- [NestJS — Configuration](https://docs.nestjs.com/techniques/configuration) — `ConfigModule`, `ConfigService`
- [NestJS — Global Modules](https://docs.nestjs.com/modules#global-modules) — `@Global()` y sus implicaciones
- [Joi — Validation](https://joi.dev/api/) — schema validation para env vars
- [TypeORM — Data Source](https://typeorm.io/data-source) — `forRootAsync` con factory

## Why Joi and not Zod for env validation

`@nestjs/config` integra nativamente con Joi via `validationSchema` en `ConfigModule.forRoot()`. Usar Zod requeriría un wrapper adicional. Para este caso específico (validación en bootstrap, no en runtime), Joi es la opción con menos fricción.

Para validación de DTOs en controllers, se usa `class-validator` (ver `api-validation`).

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [backend-architecture.md](../../../docs/backend-architecture.md) | Qué pone en SharedModule vs. qué pone en cada BC module |
| [engineering-principles.md](../../../docs/engineering-principles.md) | DRY vs. acoplamiento — cuándo algo merece ser shared y cuándo no |
