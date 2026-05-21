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

Método por defecto: `handler()`. Inyecta casos de uso — nunca repositorios ni domain services.

```typescript
// flashcards/infrastructure/controllers/flashcard.controller.ts
@Controller('flashcards')
export class FlashcardController {
  constructor(
    private readonly creator: FlashcardCreator,
    private readonly finder: FlashcardFinder,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handler(@Body() body: { front: string; back: string }): Promise<void> {
    await this.creator.execute(body.front, body.back);
  }
}
```

**Reglas:**
- Método HTTP handler siempre: `handler()` — sin nombres como `create`, `findOne`, etc.
- Sin lógica — recibe HTTP, delega al use case, devuelve respuesta
- Nombre de ruta en `kebab-case` plural: `flashcards`, `pronunciation-sessions`
- Nombre de inyección = ROL: `creator`, `finder`, `updater`, `remover`

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
├── controllers/      ← HTTP entrypoints
├── framework/        ← NestJS modules
└── persistence/      ← TypeORM entities + repositories
```

## Anti-patterns

```typescript
// ❌ Lógica en controller
async handler(@Body() body): Promise<void> {
  if (!body.front) throw new BadRequestException(); // va en VO o use case
}

// ❌ Repositorio inyectado en controller
constructor(private readonly repository: FlashcardRepository) {}

// ❌ TypeORM entity en domain o application
import { FlashcardEntity } from '../../infrastructure/persistence/flashcard.entity';

// ❌ Entity de TypeORM saliendo del repositorio
async search(id: FlashcardId): Promise<FlashcardEntity> { ... }
```
