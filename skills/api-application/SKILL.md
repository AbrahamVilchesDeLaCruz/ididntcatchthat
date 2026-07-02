---
name: api-application
description: "Convenciones de la capa Application en la API: Use Cases y Domain Services. Trigger: Al crear o modificar casos de uso o domain services en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al crear un nuevo caso de uso
- Al crear o modificar un domain service
- Al decidir si lógica va en un use case o en un domain service

> Usa el template de `assets/use-case.template.md` al crear un nuevo use case.
> Lee `references/docs.md` para ADRs, skills relacionadas y docs externos.

## Critical Patterns

### Use Cases

Nombre: `{Entidad}{Verbo}` — forma de agente. Método siempre `execute()`.

```typescript
// content/flashcard/application/create/flashcard-creator.ts
@Injectable()
export class FlashcardCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    @Inject(APP_METRICS)
    private readonly metrics: AppMetrics,
  ) {}

  async execute(request: RequestFlashcardCreator): Promise<FlashcardPrimitives> {
    const flashcard = Flashcard.create(
      request.id,
      request.expression,
      request.meaning,
      request.category,
      request.subcategory,
      request.ipaNotation,
      request.nativeSpeech,
      request.examples.map((e) => ({ ...e, flashcardId: request.id })),
      request.createdBy,
    );

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard created', {
      flashcardId: request.id,
      expression: request.expression,
    });

    this.metrics.increment('app_flashcards_created_total');

    return flashcard.toPrimitives();
  }
}
```

Re-exportar el tipo de request en el mismo archivo del use case:

```typescript
// al final del archivo, o con export type en la importación:
export type { RequestFlashcardCreator } from './request-flashcard-creator';
```

**Request* — tipo del input:**

```typescript
// content/flashcard/application/create/request-flashcard-creator.ts
export type RequestFlashcardCreator = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: { id: string; textEn: string; textEs: string; position: number }[];
  createdBy: string;
};
```

**Reglas:**

- Un caso de uso = una responsabilidad = un método público: `execute()`
- Recibe un `Request*` type object — nunca primitivos sueltos, nunca clases DTO
- `Request*` es un `type` alias — nunca una clase con decoradores
- Retorna primitivos, un objeto con primitivos, o `void` — nunca entidades de dominio
- Inyectar `LOGGER_SERVICE` y `APP_METRICS` en use cases que mutan estado relevante
- Inyectar `DOMAIN_EVENT_PUBLISHER` cuando el aggregate genera domain events
- Usar `toPrimitives()` para serializar la respuesta

### Domain Services

Para lógica reutilizable que necesitan varios casos de uso. Viven en `domain/`.

```typescript
// gaming/domain/guest-game-policy.ts  ← domain service como clase estática con reglas
export class GuestGamePolicy {
  static readonly MAX_CARD_COUNT_FOR_GUEST = 10;

  static assertCanStartNewGame(todayGameCount: number): void {
    if (todayGameCount >= 3) throw new GuestGameLimitReached();
  }
}
```

```typescript
// content/flashcard/domain/flashcard-finder.ts  ← domain service inyectable
@Injectable()
export class FlashcardFinder {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async find(id: FlashcardId): Promise<Flashcard> {
    const flashcard = await this.repository.search(id);
    if (!flashcard) throw new FlashcardNotFound(id.value);
    return flashcard;
  }
}
```

**Reglas:**

- Nombre: `{Feature}{Action}` — **sin sufijo `Service`**
- Archivo: `{feature}-{action}.ts` — ej: `flashcard-finder.ts`, `guest-game-policy.ts`
- Método con verbo descriptivo: `find()`, `validate()`, `assertCanX()`, `list()`
- Reutilizable desde varios casos de uso — si solo lo usa uno, va directo en el use case
- Puede tener `@Injectable()` cuando necesita inyectar repositorios u otros puertos
- Las políticas puras (sin I/O) pueden ser clases estáticas o funciones

### UseCase vs Domain Service

|                  | Use Case                    | Domain Service                            |
| ---------------- | --------------------------- | ----------------------------------------- |
| **Método**       | `execute()`                 | verbo descriptivo: `find()`, `validate()` |
| **Reutilizable** | No — un flujo concreto      | Sí — lo llaman varios casos de uso        |
| **Dónde**        | `application/{verb}/`       | `domain/`                                 |
| **Ejemplo**      | `FlashcardCreator.execute()` | `FlashcardFinder.find()` en domain        |

### Inyección — nombre por ROL

El nombre de la variable inyectada refleja el ROL, no la clase concreta.

```typescript
// ✅
constructor(private readonly repository: FlashcardRepository) {}
constructor(private readonly finder: FlashcardFinder) {}
constructor(private readonly publisher: DomainEventPublisher) {}

// ❌
constructor(private readonly flashcardRepository: TypeOrmFlashcardRepository) {}
constructor(private readonly flashcardFinderService: FlashcardFinderService) {}
```

### Verbos de casos de uso

| Acción        | Nombre              |
| ------------- | ------------------- |
| Crear         | `FlashcardCreator`  |
| Buscar uno    | `FlashcardFinder`   |
| Buscar varios | `FlashcardSearcher` |
| Actualizar    | `FlashcardUpdater`  |
| Eliminar      | `FlashcardDeleter`  |
| Iniciar       | `GameStarter`       |
| Completar     | `GameCompleter`     |

## Anti-patterns

```typescript
// ❌ Primitivos sueltos como parámetros
async execute(expression: string, meaning: string, category: string): Promise<void> {}
// ✅ Request type object
async execute(request: RequestFlashcardCreator): Promise<void> {}

// ❌ Clase DTO con decoradores en application
export class CreateFlashcardDto { expression: string; meaning: string; }

// ❌ Lógica de negocio en use case
async execute(request): Promise<void> {
  if (request.expression.length > 500) throw new Error('too long'); // va en VO o entidad
}

// ❌ Retornar entidad de dominio
async execute(id: string): Promise<Flashcard> { ... } // retornar primitivos

// ❌ Nombre de inyección repite la clase
constructor(private readonly flashcardCreator: FlashcardCreator) {}

// ❌ Sufijo Service en domain service
export class FlashcardFinderService {} // FlashcardFinder
```
