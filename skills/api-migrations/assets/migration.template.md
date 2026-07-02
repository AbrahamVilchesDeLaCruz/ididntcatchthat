# Template — Migration

Reemplazá `__TIMESTAMP__` y `__table_name__` por los valores reales.

El timestamp se genera automáticamente con `typeorm migration:generate`.

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

// Naming: Migration{YYYYMMDDHHmmss}{epochMs}
// Ejemplo: Migration202606291200001779990000008
export class Migration__TIMESTAMP__ implements MigrationInterface {
  name = 'Migration__TIMESTAMP__';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQL raw siempre — nunca QueryBuilder (frágil ante cambios de versión de TypeORM)
    await queryRunner.query(`
      CREATE TABLE "__table_name__" (
        "id"         uuid        NOT NULL,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK___table_name__" PRIMARY KEY ("id")
        -- Columnas adicionales de ejemplo:
        -- "name"    character varying(255) NOT NULL,
        -- "score"   integer                NOT NULL DEFAULT 0,
        -- "user_id" uuid                   NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir completamente — siempre implementar
    await queryRunner.query(`DROP TABLE IF EXISTS "__table_name__"`);
  }
}
```
