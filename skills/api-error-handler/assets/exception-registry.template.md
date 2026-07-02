# Exception Registry Template

Copy this template when adding error handling to a new module.

## File: `{context}/infrastructure/framework/{context}-exception-registry.ts`

```typescript
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { {Entity}NotFound } from '../../domain/exceptions/{entity}-not-found';
import { {Entity}AlreadyExists } from '../../domain/exceptions/{entity}-already-exists';
// Import all domain errors of this BC

@Injectable()
export class {Context}ExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [{Entity}NotFound.name, HttpStatus.NOT_FOUND],
        [{Entity}AlreadyExists.name, HttpStatus.CONFLICT],
        // Add more domain errors here
      ]),
    );
  }
}
```

## Register in the module

```typescript
// {context}/infrastructure/framework/{context}.module.ts
@Module({
  providers: [
    {Context}ExceptionRegistry, // ← just add as provider; onModuleInit runs automatically
    // ... other providers
  ],
})
export class {Context}Module {}
```

> The registry itself implements `OnModuleInit` — NestJS calls `onModuleInit()` automatically after the module is initialized, before the first request arrives. The module class does **not** need to implement `OnModuleInit`.

## HTTP Status mapping reference

| Domain Error type | HTTP Status |
|---|---|
| NotFound errors | `404 NOT_FOUND` |
| AlreadyExists errors | `409 CONFLICT` |
| Validation / invariant errors | `422 UNPROCESSABLE_ENTITY` |
| Forbidden / not allowed | `403 FORBIDDEN` |
| Credentials invalid / token expired | `401 UNAUTHORIZED` |
| Rate limit / quota exceeded | `429 TOO_MANY_REQUESTS` |
| External service failure | `502 BAD_GATEWAY` |

## Checklist

- [ ] Un registry por bounded context — no mezclar errores de distintos BCs
- [ ] Todos los domain errors del BC están registrados antes del primer request
- [ ] `GlobalExceptionRegistry` es el único punto donde se mapea DomainError → HTTP
- [ ] El registry implementa `OnModuleInit` — no el módulo
- [ ] El registry está declarado como provider en el módulo NestJS del BC
