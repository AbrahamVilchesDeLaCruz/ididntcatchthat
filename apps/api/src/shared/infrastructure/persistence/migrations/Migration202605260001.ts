import { type MigrationInterface, type QueryRunner } from 'typeorm';

/**
 * Migration: create gaming tables
 *
 * Creates the `games`, `game_flashcards` and `attempts` tables for the Gaming BC.
 * - `games` tracks game sessions for both registered and guest users
 * - `game_flashcards` stores the ordered set of flashcards for each game
 * - `attempts` records each answer within a game
 */
export class Migration202605260001 implements MigrationInterface {
  name = 'Migration202605260001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "games" (
        "id"                UUID          NOT NULL,
        "user_id"           UUID          NULL,
        "mode"              VARCHAR(20)   NOT NULL,
        "module"            VARCHAR(50)   NULL,
        "card_count"        VARCHAR(5)    NOT NULL,
        "status"            VARCHAR(20)   NOT NULL DEFAULT 'in_progress',
        "last_flashcard_id" UUID          NULL,
        "started_at"        TIMESTAMP     NOT NULL DEFAULT now(),
        "finished_at"       TIMESTAMP     NULL,
        CONSTRAINT "PK_games" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_games_card_count" CHECK ("card_count" IN ('10','20','50'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_games_user_status" ON "games" ("user_id", "status")
    `);

    await queryRunner.query(`
      CREATE TABLE "game_flashcards" (
        "game_id"       UUID  NOT NULL,
        "flashcard_id"  UUID  NOT NULL,
        "position"      INT   NOT NULL,
        CONSTRAINT "PK_game_flashcards" PRIMARY KEY ("game_id", "position"),
        CONSTRAINT "FK_game_flashcards_game" FOREIGN KEY ("game_id")
          REFERENCES "games" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_game_flashcards_game_id" ON "game_flashcards" ("game_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "attempts" (
        "id"            UUID        NOT NULL,
        "game_id"       UUID        NOT NULL,
        "flashcard_id"  UUID        NOT NULL,
        "correct"       BOOLEAN     NOT NULL,
        "answered_at"   TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attempts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_attempts_game" FOREIGN KEY ("game_id")
          REFERENCES "games" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_attempts_game_id" ON "attempts" ("game_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "attempts"`);
    await queryRunner.query(`DROP TABLE "game_flashcards"`);
    await queryRunner.query(`DROP TABLE "games"`);
  }
}
