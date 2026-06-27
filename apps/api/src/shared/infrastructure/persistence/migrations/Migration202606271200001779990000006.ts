import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606271200001779990000006 implements MigrationInterface {
  name = 'Migration202606271200001779990000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'catalog'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS achievement_catalog (
        key VARCHAR(50) PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_key VARCHAR(50) NOT NULL REFERENCES achievement_catalog(key),
        unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, achievement_key)
      )
    `);

    await queryRunner.query(`
      INSERT INTO achievement_catalog (key, title, description) VALUES
        ('first_game', 'First steps', 'Complete your first game'),
        ('streak_7', 'Week warrior', 'Reach a 7-day streak'),
        ('streak_30', 'Monthly master', 'Reach a 30-day streak'),
        ('module_mastery_2', 'Solid foundation', 'Reach mastery level 2 in any module'),
        ('module_mastery_3', 'Module master', 'Reach mastery level 3 in any module'),
        ('perfect_session_10', 'Flawless run', 'Complete a 10+ card game with 100% accuracy'),
        ('cards_100', 'Century club', 'Play 100 flashcards total'),
        ('weak_warrior', 'Weak warrior', 'Complete a weakest-flashcards practice game')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_achievements`);
    await queryRunner.query(`DROP TABLE IF EXISTS achievement_catalog`);
    await queryRunner.query(`
      ALTER TABLE games DROP COLUMN IF EXISTS source
    `);
  }
}
