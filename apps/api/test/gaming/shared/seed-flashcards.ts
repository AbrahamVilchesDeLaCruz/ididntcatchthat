import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createAdminToken } from '../../shared/infrastructure/create-admin-token';

const BASE_PAYLOAD = {
  meaning: "Short form of 'going to'",
  category: 'connected_speech',
  subcategory: 'informal_going_to',
  ipaNotation: 'ˈɡɒnə',
  nativeSpeech: null,
  examples: [],
};

export type SeedFlashcardScope = {
  category?: string;
  subcategory?: string;
};

/**
 * Seeds N flashcards into the test DB via the admin API,
 * then marks them as audio_status = 'ready' so the FlashcardSelector picks them up.
 * Call this in beforeEach for any gaming E2E test that needs data.
 * Returns the created flashcard IDs.
 */
export async function seedFlashcards(
  app: INestApplication<App>,
  count = 15,
  scope: SeedFlashcardScope = {},
): Promise<string[]> {
  const adminToken = await createAdminToken(app);
  const ids: string[] = [];
  const category = scope.category ?? BASE_PAYLOAD.category;
  const subcategory = scope.subcategory ?? BASE_PAYLOAD.subcategory;

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    await request(app.getHttpServer())
      .post('/v1/flashcards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PAYLOAD,
        category,
        subcategory,
        id,
        expression: `expression-${i}-${id.slice(0, 8)}`,
      })
      .expect(201);
    ids.push(id);
  }

  // Mark all seeded flashcards as 'ready' so TypeOrmFlashcardSelector can pick them up
  const ds = app.get(DataSource);
  await ds.query(
    `UPDATE flashcards SET audio_status = 'ready' WHERE id = ANY($1)`,
    [ids],
  );

  return ids;
}
