import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202606200410001779990000001 implements MigrationInterface {
  name = 'Migration202606200410001779990000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
        CONSTRAINT "PK_rankings_cache" PRIMARY KEY ("type", "period", "module", "rank_position")
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

    await queryRunner.query(`
      INSERT INTO "ranking_metadata" ("id", "is_dirty") VALUES (1, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ranking_metadata"`);
    await queryRunner.query(`DROP TABLE "rankings_cache"`);
  }
}
