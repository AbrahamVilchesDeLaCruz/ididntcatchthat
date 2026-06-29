import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606291200001779990000008 implements MigrationInterface {
  name = 'Migration202606291200001779990000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS game_views (
        id            UUID        NOT NULL PRIMARY KEY,
        game_id       UUID        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        flashcard_id  UUID        NOT NULL,
        viewed_at     TIMESTAMP   NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_game_views_game_id ON game_views (game_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS game_views`);
  }
}
