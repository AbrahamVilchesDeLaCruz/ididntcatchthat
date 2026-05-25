import { type MigrationInterface, type QueryRunner } from 'typeorm';

/**
 * Migration: create flashcards table
 *
 * Creates the `flashcards` table for the Content BC.
 * - `examples` stored as JSONB (1-3 examples per flashcard)
 * - `audio_urls` stored as JSONB (nullable until audio is generated)
 * - `audio_status` tracks generation lifecycle: pending | generating | ready | failed
 * - `created_by` references the user who created the flashcard (no FK — cross-BC)
 */
export class Migration202605251200001779720000000 implements MigrationInterface {
  name = 'Migration202605251200001779720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flashcards" (
        "id"            UUID          NOT NULL,
        "expression"    VARCHAR(255)  NOT NULL,
        "meaning"       TEXT          NOT NULL,
        "category"      VARCHAR(100)  NOT NULL,
        "subcategory"   VARCHAR(100)  NOT NULL,
        "ipa_notation"  VARCHAR(255)  NULL,
        "native_speech" VARCHAR(255)  NULL,
        "audio_status"  VARCHAR(20)   NOT NULL DEFAULT 'pending',
        "audio_urls"    JSONB         NULL,
        "examples"      JSONB         NOT NULL DEFAULT '[]',
        "created_by"    UUID          NOT NULL,
        "created_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_flashcards" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "flashcards"`);
  }
}
