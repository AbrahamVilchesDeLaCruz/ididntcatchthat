import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202607080500001779990000011 implements MigrationInterface {
  name = 'Migration202607080500001779990000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "flashcards"
      ADD COLUMN "deleted_at" TIMESTAMPTZ NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_flashcards_not_deleted"
      ON "flashcards" ("id")
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_flashcards_not_deleted"`);
    await queryRunner.query(`
      ALTER TABLE "flashcards"
      DROP COLUMN "deleted_at"
    `);
  }
}
