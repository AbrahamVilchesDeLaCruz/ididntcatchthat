import { type MigrationInterface, type QueryRunner } from 'typeorm';

/**
 * Migration: rename refresh_tokens → user_sessions
 *
 * Changes:
 * - Rename table `refresh_tokens` to `user_sessions`
 * - Rename column `user_id` → `owner_id` (NOT NULL — guests store deviceId)
 * - Add column `owner_type` VARCHAR(10) NOT NULL DEFAULT 'user'
 * - Add column `fingerprint` TEXT NOT NULL DEFAULT ''
 * - Back-fill: rows where old `user_id` was NULL get owner_type='guest'
 * - Drop NOT NULL DEFAULT after back-fill
 */
export class Migration202605241854361779641676650 implements MigrationInterface {
  name = 'Migration202605241854361779641676650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename table
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens" RENAME TO "user_sessions"
    `);

    // 2. Drop the FK constraint (owner_id no longer references users — guests use deviceId as ownerId)
    await queryRunner.query(`
      ALTER TABLE "user_sessions" DROP CONSTRAINT "refresh_tokens_user_id_fkey"
    `);

    // 3. Add owner_type with temporary default
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
        ADD COLUMN "owner_type" VARCHAR(10) NOT NULL DEFAULT 'user'
    `);

    // 4. Add fingerprint with temporary default
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
        ADD COLUMN "fingerprint" TEXT NOT NULL DEFAULT ''
    `);

    // 5. Rename user_id → owner_id (still nullable at this point)
    await queryRunner.query(`
      ALTER TABLE "user_sessions" RENAME COLUMN "user_id" TO "owner_id"
    `);

    // 6. Back-fill: rows where owner_id was NULL are guest sessions
    // device_id is VARCHAR so we cast to UUID (device_id is always crypto.randomUUID())
    await queryRunner.query(`
      UPDATE "user_sessions"
        SET "owner_type" = 'guest',
            "owner_id"   = "device_id"::uuid
        WHERE "owner_id" IS NULL
    `);

    // 7. Make owner_id NOT NULL (all rows now have a value)
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
        ALTER COLUMN "owner_id" SET NOT NULL
    `);

    // 8. Drop temporary defaults (fingerprint stays empty for old rows)
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
        ALTER COLUMN "owner_type" DROP DEFAULT,
        ALTER COLUMN "fingerprint" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore owner_id → user_id (nullable for guests)
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
        ALTER COLUMN "owner_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "user_sessions"
        SET "owner_id" = NULL
        WHERE "owner_type" = 'guest'
    `);

    await queryRunner.query(`
      ALTER TABLE "user_sessions" RENAME COLUMN "owner_id" TO "user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_sessions" DROP COLUMN "owner_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_sessions" DROP COLUMN "fingerprint"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_sessions" RENAME TO "refresh_tokens"
    `);
  }
}
