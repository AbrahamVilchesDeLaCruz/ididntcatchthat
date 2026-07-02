---
name: api-error-handler
description: "Convenciones de manejo de errores HTTP en la API: GlobalExceptionRegistry, filtros por módulo y HttpExceptionFilter. Trigger: Al crear domain errors, al registrar excepciones en un módulo, o al configurar el filtro HTTP en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear un nuevo domain error que debe mapearse a un HTTP status
- Al añadir un nuevo módulo con sus propias excepciones
- Al configurar el filtro global de excepciones

> Usa el template de `assets/exception-registry.template.md` al crear el registry de un nuevo BC.
> Lee `references/docs.md` para el formato del error envelope y docs externos.

## Critical Patterns

### Arquitectura del sistema de errores

```
shared/infrastructure/exceptions/
├── global-exception-registry.ts   ← registro global (Map<exceptionName, HttpStatus>)
└── http-exception.filter.ts       ← @Catch() — aplica el registry

{feature}/infrastructure/framework/
└── {feature}-exception-registry.ts  ← registra los errores del módulo en onModuleInit()
```

**Principio**: cada módulo es responsable de registrar sus propios errores. El mantenimiento va donde vive el código.

### GlobalExceptionRegistry — shared

```typescript
// shared/infrastructure/exceptions/global-exception-registry.ts
@Injectable()
export class GlobalExceptionRegistry {
  private readonly statusCodes = new Map<string, number>();

  register(registry: Map<string, number>): void {
    registry.forEach((status, exception) => {
      this.statusCodes.set(exception, status);
    });
  }

  getStatusCode(exceptionName: string): number | undefined {
    return this.statusCodes.get(exceptionName);
  }
}
```

### HttpExceptionFilter — shared

```typescript
// shared/infrastructure/exceptions/http-exception.filter.ts
@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly registry: GlobalExceptionRegistry,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorType: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      const registered = this.registry.getStatusCode(exception.constructor.name);
      if (registered !== undefined) status = registered;
      message = exception.message;
      errorType = exception.constructor.name;
    }

    const logContext = { status, path: request.url, method: request.method, errorType };

    if (status >= 500) {
      this.logger.error('Unhandled exception', exception instanceof Error ? exception : undefined, logContext);
    } else if (status >= 400 && errorType !== null) {
      this.logger.warn(exception instanceof Error ? exception.message : 'Domain error', logContext);
    } else if (status >= 400) {
      const msg = typeof message === 'string' ? message : 'HTTP client error';
      this.logger.warn(msg, logContext);
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorType,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Exception Registry por módulo

Uno por feature, en `infrastructure/framework/`. Se registra en `onModuleInit()`.

```typescript
// flashcards/infrastructure/framework/flashcard-exception-registry.ts
@Injectable()
export class FlashcardExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit() {
    this.globalRegistry.register(
      new Map<string, number>([
        [FlashcardNotFound.name, HttpStatus.NOT_FOUND],
        [FlashcardFrontEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [FlashcardAlreadyExists.name, HttpStatus.CONFLICT],
      ]),
    );
  }
}
```

Registrarlo como provider en el módulo:

```typescript
// flashcards/infrastructure/framework/flashcard.module.ts
@Module({
  providers: [
    FlashcardCreator,
    FlashcardFinder,
    FlashcardExceptionRegistry, // ← aquí
    { provide: FLASHCARD_REPOSITORY, useClass: TypeOrmFlashcardRepository },
  ],
})
export class FlashcardModule {}
```

### HTTP status por tipo de error de dominio

| Tipo de error                                          | HTTP Status                |
| ------------------------------------------------------ | -------------------------- |
| Entidad no encontrada (`NotFound`)                     | `404 NOT_FOUND`            |
| Campo inválido / vacío (`Empty`, `Invalid`)            | `422 UNPROCESSABLE_ENTITY` |
| Conflicto de estado (`AlreadyExists`, `InvalidStatus`) | `409 CONFLICT`             |
| Acción no permitida (`CannotX`)                        | `400 BAD_REQUEST`          |
| Sin permisos                                           | `403 FORBIDDEN`            |
| Credenciales inválidas / token expirado                | `401 UNAUTHORIZED`         |
| Límite de uso superado (`LimitExceeded`)               | `429 TOO_MANY_REQUESTS`    |

## Reglas

- El domain error **nunca** conoce el HTTP status — eso es responsabilidad de infrastructure
- Un `ExceptionRegistry` por módulo — nunca un registry global con todos los errores
- El registry se inicializa en `onModuleInit()` — garantiza que está listo antes de que lleguen requests
- Usar `exception.constructor.name` como key — funciona aunque el bundle minifique, porque los nombres de clase son explícitos

## Anti-patterns

```typescript
// ❌ Domain error con HTTP status
export class FlashcardNotFound extends DomainException {
  readonly statusCode = 404; // el dominio no sabe de HTTP
}

// ❌ Registry global con todos los errores de todos los módulos
globalRegistry.register(new Map([
  [FlashcardNotFound.name, 404],
  [GameNotFound.name, 404],   // esto va en game-exception-registry.ts
]));

// ❌ Try/catch en controller para mapear errores
try {
  await this.creator.execute(...);
} catch (e) {
  if (e instanceof FlashcardNotFound) throw new NotFoundException();
}
```
