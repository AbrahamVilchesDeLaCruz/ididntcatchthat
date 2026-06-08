import * as crypto from 'node:crypto';
import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { type App } from 'supertest/types';
import { TypeOrmGameFlashcardQuery } from '@/gaming/infrastructure/persistence/typeorm-game-flashcard-query';
import { type GameFlashcardExample } from '@/gaming/domain/game-flashcard-query';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';

describe('gaming/infrastructure/persistence TypeOrmGameFlashcardQuery (integration)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let query: TypeOrmGameFlashcardQuery;
  let createdGameIds: string[] = [];
  let createdFlashcardIds: string[] = [];

  beforeEach(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    query = new TypeOrmGameFlashcardQuery(dataSource);
    createdGameIds = [];
    createdFlashcardIds = [];
  });

  afterEach(async () => {
    if (createdGameIds.length > 0) {
      await dataSource.query(`DELETE FROM games WHERE id = ANY($1::uuid[])`, [
        createdGameIds,
      ]);
    }

    if (createdFlashcardIds.length > 0) {
      await dataSource.query(
        `DELETE FROM flashcards WHERE id = ANY($1::uuid[])`,
        [createdFlashcardIds],
      );
    }

    await app.close().catch(() => undefined);
  });

  async function seedGameWithFlashcard(
    examples: GameFlashcardExample[],
  ): Promise<{ gameId: string; flashcardId: string }> {
    const gameId = crypto.randomUUID();
    const flashcardId = crypto.randomUUID();
    const createdBy = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO games (id, user_id, mode, module, card_count, status)
       VALUES ($1, NULL, 'study', NULL, '10', 'in_progress')`,
      [gameId],
    );

    await dataSource.query(
      `INSERT INTO flashcards (
         id,
         expression,
         meaning,
         category,
         subcategory,
         ipa_notation,
         native_speech,
         audio_urls,
         examples,
         created_by
       )
       VALUES (
         $1,
         'gonna',
         'going to',
         'connected_speech',
         'reduction',
         '/ˈɡʌnə/',
         NULL,
         NULL,
         $2::jsonb,
         $3
       )`,
      [flashcardId, JSON.stringify(examples), createdBy],
    );

    await dataSource.query(
      `INSERT INTO game_flashcards (game_id, flashcard_id, position)
       VALUES ($1, $2, 1)`,
      [gameId, flashcardId],
    );

    createdGameIds.push(gameId);
    createdFlashcardIds.push(flashcardId);

    return { gameId, flashcardId };
  }

  it('should return flashcard examples from flashcards.examples JSONB column', async () => {
    const seededFlashcardId = crypto.randomUUID();
    const example: GameFlashcardExample = {
      id: crypto.randomUUID(),
      flashcardId: seededFlashcardId,
      textEn: "I'm gonna call you tonight.",
      textEs: 'Te voy a llamar esta noche.',
      position: 1,
    };

    const { gameId } = await seedGameWithFlashcard([
      { ...example, flashcardId: seededFlashcardId },
    ]);

    const result = await query.findByGameId(gameId);

    expect(result).toHaveLength(1);
    expect(result[0].examples).toEqual([
      { ...example, flashcardId: seededFlashcardId },
    ]);
  });

  it('should return empty examples array when flashcard examples are []', async () => {
    const { gameId } = await seedGameWithFlashcard([]);

    const result = await query.findByGameId(gameId);

    expect(result).toHaveLength(1);
    expect(result[0].examples).toEqual([]);
  });
});
