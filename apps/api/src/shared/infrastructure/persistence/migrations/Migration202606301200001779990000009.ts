import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606301200001779990000009 implements MigrationInterface {
  name = 'Migration202606301200001779990000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE achievement_catalog
      ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'game',
      ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      UPDATE achievement_catalog SET category = 'game', sort_order = 1 WHERE key = 'first_game';
      UPDATE achievement_catalog SET category = 'game', sort_order = 2 WHERE key = 'perfect_session_10';
      UPDATE achievement_catalog SET category = 'game', sort_order = 3 WHERE key = 'cards_100';
      UPDATE achievement_catalog SET category = 'game', sort_order = 4 WHERE key = 'weak_warrior';
      UPDATE achievement_catalog SET category = 'streak', sort_order = 10 WHERE key = 'streak_7';
      UPDATE achievement_catalog SET category = 'streak', sort_order = 11 WHERE key = 'streak_30';
      UPDATE achievement_catalog SET category = 'module', sort_order = 20 WHERE key = 'module_mastery_2';
      UPDATE achievement_catalog SET category = 'module', sort_order = 21 WHERE key = 'module_mastery_3';
    `);

    await queryRunner.query(`
      INSERT INTO achievement_catalog (key, title, description, category, sort_order) VALUES
        ('games_10', 'Dedicated player', 'Complete 10 games', 'game', 5),
        ('streak_100', 'Centurion', 'Reach a 100-day streak', 'streak', 12),
        ('module_all_touched', 'Explorer', 'Try at least one card in every module', 'module', 22),
        ('study_first', 'First study', 'Complete your first study session', 'study', 30),
        ('study_sessions_10', 'Study habit', 'Complete 10 study sessions', 'study', 31)
      ON CONFLICT (key) DO UPDATE SET
        category = EXCLUDED.category,
        sort_order = EXCLUDED.sort_order
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM achievement_catalog
      WHERE key IN ('games_10', 'streak_100', 'module_all_touched', 'study_first', 'study_sessions_10')
    `);

    await queryRunner.query(`
      ALTER TABLE achievement_catalog
      DROP COLUMN IF EXISTS category,
      DROP COLUMN IF EXISTS sort_order
    `);
  }
}
