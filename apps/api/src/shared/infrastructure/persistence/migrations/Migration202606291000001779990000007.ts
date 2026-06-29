import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606291000001779990000007 implements MigrationInterface {
  name = 'Migration202606291000001779990000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        path        VARCHAR(500) NOT NULL,
        visitor_id  VARCHAR(100) NOT NULL,
        user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
        referrer    VARCHAR(500),
        created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views (visitor_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS page_views`);
  }
}
