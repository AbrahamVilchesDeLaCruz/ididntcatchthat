import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606200600001779990000003 implements MigrationInterface {
  name = 'Migration202606200600001779990000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ranking_user_scores" (
        "user_id"        UUID          NOT NULL,
        "type"           VARCHAR(50)   NOT NULL,
        "period"         VARCHAR(20)   NOT NULL,
        "period_bucket"  VARCHAR(20)   NOT NULL DEFAULT 'rolling',
        "module"         VARCHAR(100)  NOT NULL DEFAULT 'global',
        "nickname"       VARCHAR(30)   NOT NULL,
        "score"          DECIMAL(12,4) NOT NULL DEFAULT 0,
        "updated_at"     TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ranking_user_scores"
          PRIMARY KEY ("user_id", "type", "period", "period_bucket", "module")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ranking_user_scores_leaderboard"
      ON "ranking_user_scores" ("type", "period", "period_bucket", "module", "score" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ranking_user_scores_user_lookup"
      ON "ranking_user_scores" ("type", "period", "period_bucket", "module", "user_id")
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "rankings_cache"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ranking_metadata"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ranking_user_scores"`);

    await queryRunner.query(`
      CREATE TABLE "rankings_cache" (
        "type"           VARCHAR(50)   NOT NULL,
        "period"         VARCHAR(20)   NOT NULL,
        "module"         VARCHAR(100)  NOT NULL,
        "rank_position"  INTEGER       NOT NULL,
        "user_id"        UUID          NOT NULL,
        "nickname"       VARCHAR(30)   NOT NULL,
        "score"          DECIMAL(12,4) NOT NULL,
        "updated_at"     TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rankings_cache"
          PRIMARY KEY ("type", "period", "module", "rank_position")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ranking_metadata" (
        "id"                   SMALLINT  NOT NULL DEFAULT 1,
        "is_dirty"             BOOLEAN   NOT NULL DEFAULT true,
        "last_recomputed_at"   TIMESTAMP,
        CONSTRAINT "PK_ranking_metadata" PRIMARY KEY ("id")
      )
    `);
  }
}
