---
name: api-infrastructure
description: >
  Convenciones de la capa Infrastructure en la API: Controllers, TypeORM entities, repositorios y módulos NestJS.
  Trigger: Al crear o modificar controllers, entidades TypeORM, repositorios o módulos en apps/api/.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear o modificar un controller
- Al crear una TypeORM entity o repositorio
- Al crear o modificar un módulo NestJS

## Critical Patterns

### Controllers

Un controller por acción — nombre: `{Entity}{Verb}{Method}Controller`.
Método siempre `handler()`. Inyecta un solo caso de uso.

```typescript
// flashcards/infrastructure/controllers/create-flashcard-post.controller.ts
@Controller('flashcards')
export class CreateFlashcardPostController {
  constructor(private readonly creator: FlashcardCreator) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handler(@Body() body: CreateFlashcardPostPayload): Promise<void> {
    await this.creator.execute(body.front, body.back);
  }
}
```

```typescript
// flashcards/infrastructure/controllers/search-flashcards-get.controller.ts
@Controller('flashcards')
export class SearchFlashcardsGetController {
  constructor(private readonly searcher: FlashcardSearcher) {}

  @Get()
  async handler(@Query() query: SearchFlashcardsGetQuery): Promise<FlashcardPrimitives[]> {
    return this.searcher.execute(query.filters ?? [], ...);
  }
}
```

**Naming:**
- Archivo: `{verb}-{resource}-{method}.controller.ts` — `create-flashcard-post.controller.ts`
- Clase: `{Verb}{Resource}{Method}Controller` — `CreateFlashcardPostController`

### Payloads y Queries

Validación con `class-validator` — solo en infrastructure, nunca pasan a application.

```typescript
// flashcards/infrastructure/controllers/create-flashcard-post.payload.ts
export class CreateFlashcardPostPayload {
  @IsString()
  @IsNotEmpty()
  front: string;

  @IsString()
  @IsNotEmpty()
  back: string;
}
```

```typescript
// flashcards/infrastructure/controllers/search-flashcards-get.query.ts
export class SearchFlashcardsGetQuery {
  @IsOptional()
  filters?: CriteriaFilterItem[];

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderType?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
```

**Naming:**
- Payload (body POST/PATCH): `{Verb}{Resource}{Method}Payload` — `CreateFlashcardPostPayload`
- Query (query params GET): `{Verb}{Resource}{Method}Query` — `SearchFlashcardsGetQuery`
- Archivo junto al controller que lo usa

**Reglas:**
- Método HTTP handler siempre: `handler()`
- Un controller = un caso de uso = una responsabilidad
- Sin lógica — recibe HTTP, delega al use case, devuelve respuesta
- Payload/Query nunca salen del controller — el use case recibe primitivos
- Queries GET devuelven `ApiResponse.of(data, resolveRequestId(req))` — ver `api-response`

### TypeORM Entities

```typescript
// flashcards/infrastructure/persistence/flashcard.entity.ts
@Entity('flashcards')
export class FlashcardEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  front: string;

  @Column()
  back: string;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;
}
```

**Reglas:**
- Sufijo `Entity` para diferenciar de la entidad de dominio
- Tabla en `snake_case` plural: `flashcards`, `pronunciation_sessions`
- Columnas: `snake_case` en DB, `camelCase` en código — usar `name` en `@Column`
- Solo en `infrastructure/persistence/` — nunca en domain ni application

### Repositorios TypeORM

Implementa el contrato del dominio. Mapeo explícito entre entity y aggregate.

```typescript
// flashcards/infrastructure/persistence/typeorm-flashcard.repository.ts
@Injectable()
export class TypeOrmFlashcardRepository implements FlashcardRepository {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly repo: Repository<FlashcardEntity>,
  ) {}

  async search(id: FlashcardId): Promise<Flashcard | null> {
    const entity = await this.repo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async match(criteria: Criteria): Promise<Flashcard[]> {
    const entities = await this.repo.find();
    return entities.map(this.toDomain.bind(this));
  }

  async save(flashcard: Flashcard): Promise<void> {
    await this.repo.save(this.toEntity(flashcard));
  }

  async remove(id: FlashcardId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  private toDomain(entity: FlashcardEntity): Flashcard {
    return Flashcard.fromPrimitives({
      id: entity.id,
      front: entity.front,
      back: entity.back,
    });
  }

  private toEntity(flashcard: Flashcard): FlashcardEntity {
    const entity = new FlashcardEntity();
    Object.assign(entity, flashcard.toPrimitives());
    return entity;
  }
}
```

**Reglas:**
- Prefijo `TypeOrm` — deja claro la implementación concreta
- `toDomain()` y `toEntity()` privados — la entity de TypeORM nunca sale del repositorio
- Implementa exactamente los 4 métodos del contrato: `match`, `search`, `save`, `remove`

### Módulos NestJS

```typescript
// flashcards/infrastructure/framework/flashcard.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([FlashcardEntity])],
  controllers: [FlashcardController],
  providers: [
    FlashcardCreator,
    FlashcardFinder,
    FlashcardFinderService,
    {
      provide: FLASHCARD_REPOSITORY,
      useClass: TypeOrmFlashcardRepository,
    },
  ],
})
export class FlashcardModule {}
```

**Reglas:**
- En `infrastructure/framework/` — lo relacionado con el framework va aquí
- Un módulo por feature
- El token de inyección como constante: `FLASHCARD_REPOSITORY` definido en `domain/`

### Estructura de carpetas infrastructure

```
infrastructure/
├── controllers/
│   ├── create-flashcard-post.controller.ts
│   ├── create-flashcard-post.payload.ts
│   ├── search-flashcards-get.controller.ts
│   ├── search-flashcards-get.query.ts
│   ├── find-flashcard-get.controller.ts
│   ├── update-flashcard-patch.controller.ts
│   ├── update-flashcard-patch.payload.ts
│   └── delete-flashcard-delete.controller.ts
├── framework/        ← NestJS modules
└── persistence/      ← TypeORM entities + repositories
```

## Anti-patterns

```typescript
// ❌ Un controller para todo el recurso
export class FlashcardController { } // un controller por acción

// ❌ Payload/Query pasando a application
async execute(payload: CreateFlashcardPostPayload): Promise<void> {} // recibe primitivos

// ❌ Lógica en controller
async handler(@Body() body): Promise<void> {
  if (!body.front) throw new BadRequestException(); // va en VO — class-validator lo valida antes
}

// ❌ Repositorio inyectado en controller
constructor(private readonly repository: FlashcardRepository) {}

// ❌ TypeORM entity saliendo del repositorio
async search(id: FlashcardId): Promise<FlashcardEntity> { ... }

// ❌ Archivos .response.ts por controller — PROHIBIDO
// search-flashcards-get.response.ts  ← NO existe este patrón
// find-flashcard-get.response.ts     ← NO existe este patrón
// Los tipos de respuesta son primitivos del dominio (toPrimitives()) o interfaces inline
// Para el envelope usa ApiResponse<T> / PaginatedApiResponse<T> de shared — ver skill api-response
```
