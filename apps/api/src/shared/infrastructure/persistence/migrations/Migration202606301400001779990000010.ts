import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606301400001779990000010 implements MigrationInterface {
  name = 'Migration202606301400001779990000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_achievement_progress" (
        "user_id" uuid NOT NULL,
        "completed_games_count" integer NOT NULL DEFAULT 0,
        "completed_study_sessions_count" integer NOT NULL DEFAULT 0,
        "total_played_attempts" integer NOT NULL DEFAULT 0,
        "touched_modules" jsonb NOT NULL DEFAULT '[]',
        CONSTRAINT "PK_user_achievement_progress" PRIMARY KEY ("user_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_achievement_progress"`);
  }
}
