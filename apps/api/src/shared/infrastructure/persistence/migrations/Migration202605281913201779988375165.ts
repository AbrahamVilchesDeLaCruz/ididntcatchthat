import { type MigrationInterface, type QueryRunner } from 'typeorm';

/**
 * Migration: create module_progress and processed_events tables
 *
 * module_progress:
 *   - PK compuesta: (user_id, module) — UPSERT natural
 *   - `mastery_level` 0-3 calculated from totalAttempts + accuracy
 *
 * processed_events:
 *   - Inbox pattern para idempotencia de event handlers
 *   - PK compuesta: (event_id, handler)
 */
export class Migration202605281913201779988375165 implements MigrationInterface {
  name = 'Migration202605281913201779988375165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "module_progress" (
        "user_id"        UUID          NOT NULL,
        "module"         VARCHAR(100)  NOT NULL,
        "total_attempts" INTEGER       NOT NULL DEFAULT 0,
        "correct_count"  INTEGER       NOT NULL DEFAULT 0,
        "accuracy"       DECIMAL(5,4)  NOT NULL DEFAULT 0,
        "mastery_level"  SMALLINT      NOT NULL DEFAULT 0,
        "last_played_at" TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_module_progress" PRIMARY KEY ("user_id", "module")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_module_progress_user" ON "module_progress" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "processed_events" (
        "event_id"     UUID          NOT NULL,
        "handler"      VARCHAR(255)  NOT NULL,
        "processed_at" TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_processed_events" PRIMARY KEY ("event_id", "handler")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "processed_events"`);
    await queryRunner.query(`DROP INDEX "idx_module_progress_user"`);
    await queryRunner.query(`DROP TABLE "module_progress"`);
  }
}
