import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606260000000000005 implements MigrationInterface {
  name = 'Migration202606260000000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE games
      DROP COLUMN IF EXISTS subcategory
    `);
  }
}
