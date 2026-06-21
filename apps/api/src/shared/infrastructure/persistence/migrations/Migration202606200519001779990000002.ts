import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606200519001779990000002 implements MigrationInterface {
  name = 'Migration202606200519001779990000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "idx_games_completed_finished_at"
      ON "games" ("finished_at")
      WHERE "status" = 'completed' AND "mode" = 'game'
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_user_flashcard_stats_last_seen_at"
      ON "user_flashcard_stats" ("last_seen_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_module_progress_module"
      ON "module_progress" ("module")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_show_in_ranking_streak"
      ON "users" ("current_streak" DESC)
      WHERE "show_in_ranking" = true AND "current_streak" > 0
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_rankings_cache_user_lookup"
      ON "rankings_cache" ("type", "period", "module", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_rankings_cache_user_lookup"`);
    await queryRunner.query(`DROP INDEX "idx_users_show_in_ranking_streak"`);
    await queryRunner.query(`DROP INDEX "idx_module_progress_module"`);
    await queryRunner.query(
      `DROP INDEX "idx_user_flashcard_stats_last_seen_at"`,
    );
    await queryRunner.query(`DROP INDEX "idx_games_completed_finished_at"`);
  }
}
