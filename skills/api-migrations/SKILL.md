---
name: api-migrations
description: "TypeORM migrations formato, seeds idempotentes en apps/api/. Trigger: Al crear una nueva migración TypeORM, añadir seeds de datos iniciales o de prueba."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---


## When to Use

- Al crear una nueva migración TypeORM
- Al añadir seeds de datos iniciales o de prueba
- Al entender cuándo correr migrations vs seeds

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

---

## Migrations

### Naming

```
Migration{timestamp}

timestamp = YYYYMMDDHHmmss + epoch ms concatenados
```

```typescript
// src/shared/infrastructure/persistence/migrations/Migration2025040217091743613792720.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration2025040217091743613792720 implements MigrationInterface {
  name = 'Migration2025040217091743613792720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flashcard" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "phrase" character varying NOT NULL,
        "translation" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_flashcard" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "flashcard"`);
  }
}
```

**Reglas:**
- `up` — aplica el cambio
- `down` — lo revierte **completamente** — siempre implementar
- SQL raw en migraciones — nunca usar el QueryBuilder de TypeORM (frágil ante cambios de versión)
- `synchronize: false` en TypeORM config — **siempre**
- Las migraciones son la **única fuente de verdad** del schema

### Ubicación

```
src/shared/infrastructure/persistence/migrations/
└── Migration2025040217091743613792720.ts
└── Migration2025040218103012345678901.ts
```

### Comandos

```bash
# Generar migración a partir de cambios en entities
pnpm typeorm migration:generate src/shared/infrastructure/persistence/migrations/MigrationName

# Correr migraciones pendientes
pnpm typeorm migration:run

# Revertir última migración
pnpm typeorm migration:revert

# Ver estado de migraciones
pnpm typeorm migration:show
```

---

## Seeds

Los seeds van al mismo nivel que `migrations/`:

```
src/shared/infrastructure/persistence/
├── migrations/
│   └── Migration2025040217091743613792720.ts
└── seeds/
    ├── flashcard.seed.ts
    └── run-seeds.ts
```

### Seed structure

```typescript
// src/shared/infrastructure/persistence/seeds/flashcard.seed.ts
import { DataSource } from 'typeorm';
import { FlashcardTypeOrmEntity } from '@flashcards/shared/infrastructure/persistence/flashcard.typeorm-entity';

export async function seedFlashcards(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(FlashcardTypeOrmEntity);

  const exists = await repo.count();
  if (exists > 0) return; // idempotente — no duplicar si ya hay datos

  await repo.insert([
    { id: 'uuid-1', phrase: "I didn't catch that", translation: 'No entendí eso' },
    { id: 'uuid-2', phrase: "Could you say that again?", translation: '¿Podrías repetirlo?' },
  ]);
}
```

```typescript
// src/shared/infrastructure/persistence/seeds/run-seeds.ts
import { AppDataSource } from '../typeorm/typeorm.config';
import { seedFlashcards } from './flashcard.seed';

async function run(): Promise<void> {
  await AppDataSource.initialize();
  await seedFlashcards(AppDataSource);
  await AppDataSource.destroy();
  console.log('Seeds completed');
}

run().catch(console.error);
```

**Reglas:**
- Los seeds son **idempotentes** — verificar antes de insertar
- Seeds de datos de prueba → solo en entornos `development` / `test`
- Seeds de datos iniciales de producción (ej: roles, categorías base) → también en `production`
- Guardar UUIDs fijos en seeds de producción para referencias cruzadas estables
- Correr seeds manualmente: `pnpm ts-node src/shared/infrastructure/persistence/seeds/run-seeds.ts`
