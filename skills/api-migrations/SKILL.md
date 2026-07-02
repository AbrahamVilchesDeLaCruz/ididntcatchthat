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
// src/shared/infrastructure/persistence/migrations/Migration202605230526271779506787479.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202605230526271779506787479 implements MigrationInterface {
  name = 'Migration202605230526271779506787479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flashcards" (
        "id"         UUID        NOT NULL,
        "expression" VARCHAR     NOT NULL,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_flashcards" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "flashcards"`);
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
└── Migration202605230526271779506787479.ts
└── Migration202605241854361779641676650.ts
```

### Comandos

```bash
# Correr migraciones pendientes (requiere Doppler con credenciales de DB)
pnpm migration:run

# Revertir última migración
pnpm migration:revert

# Ver estado de migraciones
pnpm migration:show

# Correr migraciones en local (sin Doppler, usa .env.local)
pnpm migration:run:local
```

> No existe script `migration:generate` en package.json — las migraciones se crean a mano con el template en `assets/migration.template.md`. El timestamp se compone de `YYYYMMDDHHmmss` + epoch en ms concatenados (ej: `202605230526271779506787479`).

---

## Seeds

Los seeds van al mismo nivel que `migrations/`:

```
src/shared/infrastructure/persistence/
├── migrations/
│   └── Migration202605230526271779506787479.ts
└── seeds/
    ├── local-demo.seed.ts   ← datos de prueba locales
    └── run-local-seeds.ts   ← entry point del seed runner
```

### Seed structure

Los seeds usan **SQL raw** vía `dataSource.query()` — no entity repositories. Eso los hace independientes del ORM y de los tipos de entidad.

```typescript
// src/shared/infrastructure/persistence/seeds/local-demo.seed.ts
import { type DataSource } from 'typeorm';

export const DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
export const DEMO_EMAIL = 'demo@local.dev';

export async function seedLocalDemo(dataSource: DataSource): Promise<void> {
  // idempotente — verificar antes de insertar
  const existing = await dataSource.query<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM users WHERE email = $1`,
    [DEMO_EMAIL],
  );

  if (parseInt(existing[0]?.count ?? '0', 10) > 0) {
    process.stdout.write('Local demo seed already applied — skipping.\n');
    return;
  }

  await dataSource.query(
    `INSERT INTO users (id, email, nickname, role, show_in_ranking, current_streak, longest_streak, created_at, updated_at)
     VALUES ($1, $2, 'demo', 'admin', true, 0, 0, NOW(), NOW())`,
    [DEMO_USER_ID, DEMO_EMAIL],
  );

  process.stdout.write(`Local demo seed complete.\n`);
}
```

```typescript
// src/shared/infrastructure/persistence/seeds/run-local-seeds.ts
import { AppDataSource } from '../typeorm/typeorm.config.cli';
import { seedLocalDemo } from './local-demo.seed';

async function run(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations(); // asegura que el schema existe antes de seedear
  await seedLocalDemo(AppDataSource);
  await AppDataSource.destroy();
}

run().catch((error: unknown) => {
  process.stderr.write(`Local seed failed: ${String(error)}\n`);
  process.exit(1);
});
```

**Reglas:**
- Los seeds son **idempotentes** — verificar con `SELECT COUNT(*)` antes de insertar
- Usar **SQL raw** (`dataSource.query()`) — no entity repositories ni QueryBuilder
- Llamar `AppDataSource.runMigrations()` antes de seedear — garantiza que el schema existe
- Seeds de datos de prueba → solo en entornos `development` / `test`
- Seeds de datos iniciales de producción (ej: roles, categorías base) → también en `production`
- Guardar UUIDs fijos en seeds de producción para referencias cruzadas estables
- Correr seeds: `pnpm seed:local`
