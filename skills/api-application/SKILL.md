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

    this.logger.info("Flashcard created", {
      flashcardId: request.id,
      expression: request.expression,
    });

    this.metrics.increment("app_flashcards_created_total");

    return flashcard.toPrimitives();
  }
}
```

Re-exportar `Request*` y `Response*` en el mismo archivo del use case:

```typescript
// game-completer.ts — al inicio del archivo, tras los imports
export type { RequestGameCompleter, ResponseGameCompleter };
```

**Request\* — tipo del input:**

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

**`Response*` — tipo del output cuando devuelve datos complejos:**

```typescript
// gaming/application/complete/response-game-completer.ts
export type ResponseGameCompleter = {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  duration: number;
  cardsViewed: number;
};
```

Crear `response-{entity}-{verb}er.ts` siempre que el use case devuelva más de un campo o el tipo no sea un primitivo simple. Re-exportarlo junto al `Request*` en el archivo del use case.

**Reglas:**

- Un caso de uso = una responsabilidad = un método público: `execute()`
- Recibe un `Request*` type — nunca primitivos sueltos, nunca clases DTO
- `Request*` y `Response*` son `type` alias — nunca clases con decoradores
- Retorna primitivos, `Response*`, o `void` — nunca entidades de dominio
- Los use cases de **write siempre inyectan `DOMAIN_EVENT_PUBLISHER`** — si el aggregate no emite eventos, es un bug en el aggregate, no una razón para omitirlo
- Inyectar `LOGGER_SERVICE` y `APP_METRICS` en todos los use cases que mutan estado
- Usar `toPrimitives()` para serializar la respuesta

### Domain Services

Cuando la **misma lógica de dominio** es necesaria en varios use cases, se extrae a un Domain Service en `domain/`. El criterio no es I/O vs no-I/O — es reutilización entre use cases.

```typescript
// gaming/domain/guest-game-policy.ts  ← política pura: varios UCs la consultan
export class GuestGamePolicy {
  static readonly MAX_CARD_COUNT_FOR_GUEST = 10;

  static assertCanStartNewGame(todayGameCount: number): void {
    if (todayGameCount >= 3) throw new GuestGameLimitReached();
  }
}
```

```typescript
// content/flashcard/domain/flashcard-finder.ts  ← domain service inyectable
// UpdateFlashcard, DeleteFlashcard, etc. todos necesitan primero encontrar la entidad
@Injectable()
export class FlashcardFinder {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async findOrFail(id: FlashcardId): Promise<Flashcard> {
    const flashcard = await this.repository.search(id);
    if (!flashcard) throw new FlashcardNotFound(id.value);
    return flashcard;
  }
}
```

**Reglas:**

- Nombre: `{Feature}{Action}` — **sin sufijo `Service`**
- Archivo: `{feature}-{action}.ts` — ej: `flashcard-finder.ts`, `guest-game-policy.ts`
- Método con verbo descriptivo: `findOrFail()`, `validate()`, `assertCanX()`
- **Si la lógica solo la usa un use case → va en el use case, no se extrae**
- **Si varios use cases comparten la lógica → Domain Service en `domain/`**
- Puede tener `@Injectable()` cuando necesita repositorios u otros puertos
- Clases estáticas para políticas puras (sin I/O): `GuestGamePolicy`, `PausedGamePolicy`

### UseCase vs Domain Service

|                  | Use Case                       | Domain Service                                     |
| ---------------- | ------------------------------ | -------------------------------------------------- |
| **Qué es**       | Una transacción de aplicación  | Lógica de dominio reutilizada por varios use cases |
| **Método**       | `execute()`                    | verbo descriptivo: `findOrFail()`, `assertCanX()`  |
| **Reutilizable** | No — un flujo concreto         | Sí — varios UCs lo llaman                          |
| **Dónde**        | `application/{verb}/`          | `domain/`                                          |
| **Ejemplo**      | `FlashcardCreator.execute()`   | `FlashcardFinder` (usado por updater, deleter…)    |
| **Criterio**     | Una sola acción de negocio     | Si extraes lógica de 2+ UCs, va aquí               |

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
