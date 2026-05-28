import { type MigrationInterface, type QueryRunner } from 'typeorm';

/**
 * Migration: create user_flashcard_stats table
 *
 * Stores per-user, per-flashcard study and play statistics for the Progress BC.
 * - PK compuesta: (user_id, flashcard_id) — natural idempotency key
 * - `accuracy_rate` = correctCount / timesPlayed, recalculated on each update
 * - `times_studied` tracks study mode, does NOT affect accuracy_rate
 */
export class Migration202605281913001779988354467 implements MigrationInterface {
  name = 'Migration202605281913001779988354467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_flashcard_stats" (
        "user_id"       UUID          NOT NULL,
        "flashcard_id"  UUID          NOT NULL,
        "times_studied" INTEGER       NOT NULL DEFAULT 0,
        "times_played"  INTEGER       NOT NULL DEFAULT 0,
        "correct_count" INTEGER       NOT NULL DEFAULT 0,
        "accuracy_rate" DECIMAL(5,4)  NOT NULL DEFAULT 0,
        "last_seen_at"  TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_flashcard_stats" PRIMARY KEY ("user_id", "flashcard_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_user_flashcard_stats_user" ON "user_flashcard_stats" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_user_flashcard_stats_accuracy"
        ON "user_flashcard_stats" ("user_id", "accuracy_rate" ASC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_user_flashcard_stats_accuracy"`);
    await queryRunner.query(`DROP INDEX "idx_user_flashcard_stats_user"`);
    await queryRunner.query(`DROP TABLE "user_flashcard_stats"`);
  }
}
