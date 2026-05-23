import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migration202605230526271779506787479 implements MigrationInterface {
  name = 'Migration202605230526271779506787479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"              VARCHAR(254) NOT NULL UNIQUE,
        "password_hash"      VARCHAR      NULL,
        "nickname"           VARCHAR(30)  NOT NULL UNIQUE,
        "avatar_url"         VARCHAR      NULL,
        "role"               VARCHAR      NOT NULL DEFAULT 'user'
                               CHECK ("role" IN ('user','teacher','admin','premium')),
        "oauth_provider"     VARCHAR      NULL
                               CHECK ("oauth_provider" IN ('google')),
        "show_in_ranking"    BOOLEAN      NOT NULL DEFAULT false,
        "current_streak"     INT          NOT NULL DEFAULT 0,
        "longest_streak"     INT          NOT NULL DEFAULT 0,
        "last_activity_date" DATE         NULL,
        "created_at"         TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"         TIMESTAMP    NOT NULL DEFAULT now()
      )
    `);

    // user_id is nullable — guest tokens have no row in users
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id"         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
        "token_id"   VARCHAR   NOT NULL UNIQUE,
        "user_id"    UUID      NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "device_id"  VARCHAR   NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "revoked_at" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_tokens_token_id" ON "refresh_tokens"("token_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_refresh_tokens_token_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_refresh_tokens_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
