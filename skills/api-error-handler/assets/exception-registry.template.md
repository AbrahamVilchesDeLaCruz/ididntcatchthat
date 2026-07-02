# Exception Registry Template

Copy this template when adding error handling to a new module.

## File: `{context}/infrastructure/framework/{context}-exception-registry.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/http/global-exception-registry';
import { {Entity}NotFound } from '../../domain/{entity}-not-found';
import { {Entity}AlreadyExists } from '../../domain/{entity}-already-exists';
// Import all domain errors of this BC

@Injectable()
export class {Context}ExceptionRegistry {
  constructor(private readonly registry: GlobalExceptionRegistry) {}

  register(): void {
    this.registry.add({Entity}NotFound, {
      status: HttpStatus.NOT_FOUND,
      code: '{entity}_not_found',
    });

    this.registry.add({Entity}AlreadyExists, {
      status: HttpStatus.CONFLICT,
      code: '{entity}_already_exists',
    });

    // Add more domain errors here
  }
}
```

## Register in the module

```typescript
// {context}/infrastructure/framework/{context}.module.ts
@Module({
  providers: [
    {Context}ExceptionRegistry,
    // ... other providers
  ],
})
export class {Context}Module implements OnModuleInit {
  constructor(private readonly registry: {Context}ExceptionRegistry) {}

  onModuleInit(): void {
    this.registry.register();
  }
}
```

## HTTP Status mapping reference

| Domain Error type | HTTP Status | Code pattern |
|---|---|---|
| NotFound errors | `404 NOT_FOUND` | `{entity}_not_found` |
| AlreadyExists errors | `409 CONFLICT` | `{entity}_already_exists` |
| Validation / invariant errors | `422 UNPROCESSABLE_ENTITY` | `{entity}_{reason}` |
| Forbidden / not allowed | `403 FORBIDDEN` | `{entity}_{action}_not_allowed` |
| External service failure | `502 BAD_GATEWAY` | `{service}_unavailable` |

## Checklist

- [ ] Un registry por bounded context — no mezclad errores de distintos BCs
- [ ] Todos los domain errors del BC están registrados antes del primer request
- [ ] El código (`code`) es `snake_case`, identifica unívocamente el error
- [ ] `GlobalExceptionRegistry` es el único punto donde se mapea DomainError → HTTP
- [ ] `onModuleInit()` en el módulo — no en el constructor del registry
