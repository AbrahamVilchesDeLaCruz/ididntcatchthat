# API — Naming & Code Conventions

> Aplica a `apps/api/`. Stack: NestJS + TypeScript + TypeORM + Clean Architecture.

---

## Estructura por feature

Screaming Architecture — la estructura grita lo que hace el sistema, no el framework.

```
apps/api/src/
├── flashcards/
│   ├── domain/
│   │   ├── flashcard.ts                  ← entidad raíz
│   │   ├── flashcard-id.ts               ← value object
│   │   ├── audio-url.ts                  ← value object
│   │   └── flashcard.repository.ts       ← interface del repositorio
│   ├── application/
│   │   ├── flashcard-creator.ts          ← caso de uso
│   │   ├── flashcard-finder.ts           ← caso de uso
│   │   ├── flashcard-updater.ts          ← caso de uso
│   │   ├── flashcard-deleter.ts          ← caso de uso
│   │   └── dtos/
│   │       ├── create-flashcard.dto.ts
│   │       └── update-flashcard.dto.ts
│   └── infrastructure/
│       ├── flashcard.controller.ts       ← HTTP entrypoint
│       ├── flashcard.module.ts           ← NestJS module
│       └── persistence/
│           ├── typeorm-flashcard.repository.ts
│           └── flashcard.entity.ts       ← TypeORM entity
├── shared/
│   ├── domain/
│   │   └── value-object.ts              ← clase base abstracta
│   └── infrastructure/
│       └── database.module.ts
└── main.ts
```

---

## Naming — reglas generales

| Tipo de archivo    | Convention                                               | Ejemplo                          |
| ------------------ | -------------------------------------------------------- | -------------------------------- |
| Todo               | `kebab-case`                                             | `flashcard-creator.ts`           |
| Clases             | `PascalCase`                                             | `FlashcardCreator`               |
| Interfaces         | `PascalCase` sin prefijo `I`                             | `FlashcardRepository`            |
| Tipos              | `PascalCase`                                             | `FlashcardStatus`                |
| Variables / params | `camelCase`                                              | `flashcardId`                    |
| Constantes         | `SCREAMING_SNAKE_CASE`                                   | `MAX_REVIEW_INTERVAL`            |
| Enums              | `PascalCase` (nombre) + `SCREAMING_SNAKE_CASE` (valores) | `FlashcardStatus.PENDING_REVIEW` |

---

## Domain

### Entidades

Clase pura sin decoradores de framework. Encapsula lógica de negocio.

```typescript
// flashcards/domain/flashcard.ts
export class Flashcard {
  constructor(
    readonly id: FlashcardId,
    readonly front: string,
    readonly back: string,
    private reviewCount: number,
    private nextReviewAt: Date,
  ) {}

  markAsReviewed(quality: number): void {
    // lógica de spaced repetition aquí
    this.reviewCount++;
  }

  isOverdue(): boolean {
    return this.nextReviewAt < new Date();
  }
}
```

**Reglas:**

- Sin decoradores NestJS ni TypeORM
- Métodos en `camelCase` con verbos descriptivos
- Estado privado — exponer solo lo necesario
- Lógica de negocio aquí, nunca en servicios de aplicación

### Value Objects

Inmutables. Sin sufijo `VO` ni `ValueObject` en el nombre del archivo ni la clase.

```typescript
// flashcards/domain/flashcard-id.ts
export class FlashcardId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("FlashcardId cannot be empty");
    }
  }

  equals(other: FlashcardId): boolean {
    return this.value === other.value;
  }

  static generate(): FlashcardId {
    return new FlashcardId(crypto.randomUUID());
  }
}
```

**Reglas:**

- `readonly` en todas las propiedades
- Validación en el constructor — si el valor es inválido, lanza error
- Método `equals()` para comparación
- Factory estático `create()` o `generate()` cuando aplique

### Interfaces de repositorio

```typescript
// flashcards/domain/flashcard.repository.ts
export interface FlashcardRepository {
  findById(id: FlashcardId): Promise<Flashcard | null>;
  findAllByUser(userId: UserId): Promise<Flashcard[]>;
  save(flashcard: Flashcard): Promise<void>;
  delete(id: FlashcardId): Promise<void>;
}
```

**Reglas:**

- Solo en `domain/` — el dominio define el contrato, la infraestructura lo implementa
- Nombre igual que la entidad + `Repository` — sin prefijo `I`
- Métodos en `camelCase` con verbos semánticos: `find`, `save`, `delete` — nunca `get`, `insert`, `remove`

---

## Application

### Casos de uso

Nombre: `{Entidad}{Verbo}` — verbo en inglés, forma de agente.

```typescript
// flashcards/application/flashcard-creator.ts
@Injectable()
export class FlashcardCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly flashcardRepository: FlashcardRepository,
  ) {}

  async run(dto: CreateFlashcardDto): Promise<void> {
    const flashcard = new Flashcard(FlashcardId.generate(), dto.front, dto.back, 0, new Date());

    await this.flashcardRepository.save(flashcard);
  }
}
```

**Reglas:**

- Un caso de uso = una responsabilidad = un método público: `run()`
- Recibe DTO, trabaja con entidades de dominio, nunca retorna entidades — retorna primitivos o DTOs de respuesta
- Sin lógica de negocio — eso va en la entidad
- `@Injectable()` para que NestJS lo inyecte

### Verbos de casos de uso

| Acción                      | Nombre              |
| --------------------------- | ------------------- |
| Crear                       | `FlashcardCreator`  |
| Buscar uno                  | `FlashcardFinder`   |
| Buscar varios               | `FlashcardSearcher` |
| Actualizar                  | `FlashcardUpdater`  |
| Eliminar                    | `FlashcardDeleter`  |
| Revisar (acción de dominio) | `FlashcardReviewer` |

### DTOs

```typescript
// flashcards/application/dtos/create-flashcard.dto.ts
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateFlashcardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  front: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  back: string;
}
```

**Reglas:**

- Nombre: `{Accion}{Entidad}Dto` — siempre con sufijo `Dto`
- Class Validator para validación — nunca validar a mano
- Solo en `application/dtos/` — nunca en `domain/` ni `infrastructure/`

---

## Infrastructure

### Controllers

```typescript
// flashcards/infrastructure/flashcard.controller.ts
@Controller("flashcards")
export class FlashcardController {
  constructor(private readonly flashcardCreator: FlashcardCreator) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFlashcardDto): Promise<void> {
    await this.flashcardCreator.run(dto);
  }
}
```

**Reglas:**

- Sin lógica — solo recibe HTTP, delega al caso de uso, devuelve respuesta
- Un controller por feature
- Inyecta casos de uso, nunca repositorios directamente
- Nombre de ruta en `kebab-case` plural: `flashcards`, `pronunciation-sessions`

### TypeORM Entities

```typescript
// flashcards/infrastructure/persistence/flashcard.entity.ts
@Entity("flashcards")
export class FlashcardEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  front: string;

  @Column()
  back: string;

  @Column({ name: "review_count", default: 0 })
  reviewCount: number;

  @Column({ name: "next_review_at", type: "timestamp" })
  nextReviewAt: Date;
}
```

**Reglas:**

- Sufijo `Entity` para diferenciar de la entidad de dominio
- Tabla en `snake_case` plural: `flashcards`, `pronunciation_sessions`
- Columnas en `snake_case` en DB, `camelCase` en código — usar `name` en `@Column`
- Solo en `infrastructure/persistence/` — nunca en domain ni application

### Repositorios TypeORM

```typescript
// flashcards/infrastructure/persistence/typeorm-flashcard.repository.ts
@Injectable()
export class TypeOrmFlashcardRepository implements FlashcardRepository {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly repo: Repository<FlashcardEntity>,
  ) {}

  async findById(id: FlashcardId): Promise<Flashcard | null> {
    const entity = await this.repo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async save(flashcard: Flashcard): Promise<void> {
    await this.repo.save(this.toEntity(flashcard));
  }

  private toDomain(entity: FlashcardEntity): Flashcard {
    return new Flashcard(
      new FlashcardId(entity.id),
      entity.front,
      entity.back,
      entity.reviewCount,
      entity.nextReviewAt,
    );
  }

  private toEntity(flashcard: Flashcard): FlashcardEntity {
    const entity = new FlashcardEntity();
    entity.id = flashcard.id.value;
    entity.front = flashcard.front;
    entity.back = flashcard.back;
    return entity;
  }
}
```

**Reglas:**

- Prefijo `TypeOrm` para dejar claro la implementación concreta
- Métodos privados `toDomain()` y `toEntity()` — nunca exponer la entity de TypeORM fuera del repositorio
- Implementa la interface de dominio — el contrato lo manda el dominio

### Módulos

```typescript
// flashcards/infrastructure/flashcard.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([FlashcardEntity])],
  controllers: [FlashcardController],
  providers: [
    FlashcardCreator,
    FlashcardFinder,
    {
      provide: FLASHCARD_REPOSITORY,
      useClass: TypeOrmFlashcardRepository,
    },
  ],
})
export class FlashcardModule {}
```

**Reglas:**

- Un módulo por feature en `infrastructure/`
- El token de inyección como constante: `FLASHCARD_REPOSITORY` en `domain/`
- Controllers, casos de uso y repositorio se registran aquí

---

## Errores de dominio

```typescript
// shared/domain/domain-error.ts
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// flashcards/domain/flashcard-not-found.ts
export class FlashcardNotFound extends DomainError {
  constructor(id: string) {
    super(`Flashcard with id ${id} not found`);
  }
}
```

**Reglas:**

- Nombre: `{Entidad}{Problema}` — sin sufijo `Error` ni `Exception`
- Extienden `DomainError` — nunca `Error` directamente
- Solo describen QUÉ pasó — el controller decide el status HTTP

---

## Anti-patrones prohibidos

```typescript
// ❌ TypeORM entity en application
import { FlashcardEntity } from '../infrastructure/persistence/flashcard.entity';

// ❌ Lógica de negocio en caso de uso
async run(dto: CreateFlashcardDto): Promise<void> {
  if (dto.front.length > 500) throw new Error('too long'); // esto va en el VO o entidad
}

// ❌ Repositorio inyectado en controller
constructor(private readonly repo: FlashcardRepository) {} // solo casos de uso

// ❌ any
const result: any = await this.repo.findById(id);

// ❌ Sufijo en value object
export class FlashcardIdVO {} // mal
export class FlashcardIdValueObject {} // mal
export class FlashcardId {} // ✅
```
