---
name: api-application
description: >
  Convenciones de la capa Application en la API: Use Cases y Domain Services.
  Trigger: Al crear o modificar casos de uso o domain services en apps/api/.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear un nuevo caso de uso
- Al crear o modificar un domain service
- Al decidir si lógica va en un use case o en un domain service

## Critical Patterns

### Use Cases

Nombre: `{Entidad}{Verbo}` — forma de agente. Método siempre `execute()`.

```typescript
// flashcards/application/create/flashcard-creator.ts
@Injectable()
export class FlashcardCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async execute(front: string, back: string): Promise<void> {
    const flashcard = new Flashcard(FlashcardId.generate(), front, back);
    await this.repository.save(flashcard);
  }
}
```

```typescript
// flashcards/application/find/flashcard-finder.ts
@Injectable()
export class FlashcardFinder {
  constructor(private readonly finder: FlashcardFinderService) {}

  async execute(id: string): Promise<FlashcardPrimitives> {
    const flashcard = await this.finder.find(new FlashcardId(id));
    return flashcard.toPrimitives();
  }
}
```

**Reglas:**

- Un caso de uso = una responsabilidad = un método público: `execute()`
- Recibe parámetros primitivos — sin clases DTO
- Retorna primitivos o `void` — nunca entidades de dominio
- Sin lógica de negocio — eso va en el aggregate o domain service
- Usa `toPrimitives()` para serializar la respuesta

### Domain Services

Para lógica reutilizable que necesitan varios casos de uso. Viven en `domain/`.

```typescript
// flashcards/domain/flashcard-finder.service.ts
@Injectable()
export class FlashcardFinderService {
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

- Nombre: `{Feature}{Action}Service` con sufijo `Service`
- Método con verbo descriptivo: `find()`, `validate()`, `calculate()`
- Reutilizable desde múltiples casos de uso — si solo lo usa uno, va directo en el use case

### UseCase vs Domain Service

|                  | Use Case                    | Domain Service                            |
| ---------------- | --------------------------- | ----------------------------------------- |
| **Método**       | `execute()`                 | verbo descriptivo: `find()`, `validate()` |
| **Reutilizable** | No — un flujo concreto      | Sí — lo llaman varios casos de uso        |
| **Dónde**        | `application/{verb}/`       | `domain/`                                 |
| **Ejemplo**      | `FlashcardFinder.execute()` | `FlashcardFinderService.find()`           |

### Inyección — nombre por ROL

El nombre de la variable inyectada refleja el ROL, no la clase concreta.

```typescript
// ✅
constructor(private readonly repository: FlashcardRepository) {}
constructor(private readonly finder: FlashcardFinderService) {}
constructor(private readonly creator: FlashcardCreatorService) {}

// ❌
constructor(private readonly flashcardRepository: FlashcardRepository) {}
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

## Anti-patterns

```typescript
// ❌ DTO como clase en application
export class CreateFlashcardDto { front: string; back: string; }

// ❌ Lógica de negocio en use case
async execute(front: string): Promise<void> {
  if (front.length > 500) throw new Error('too long'); // va en VO o entidad
}

// ❌ Retornar entidad de dominio
async execute(id: string): Promise<Flashcard> { ... } // retornar primitivos

// ❌ Nombre de inyección repite la clase
constructor(private readonly flashcardCreator: FlashcardCreator) {}
```
