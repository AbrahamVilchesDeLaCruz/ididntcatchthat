import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { type App } from 'supertest/types';

/**
 * Seeds native_sounds flashcards directly in the DB for progress/ranking E2E.
 * Avoids POST /v1/flashcards so seeding does not trigger content async pipelines.
 */
export async function seedNativeSoundsFlashcards(
  app: INestApplication<App>,
  count = 15,
): Promise<string[]> {
  const ds = app.get(DataSource);
  const createdBy = crypto.randomUUID();
  const ids: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    await ds.query(
      `INSERT INTO flashcards (
         id, expression, meaning, category, subcategory,
         ipa_notation, native_speech, audio_status, examples, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ready', '[]'::jsonb, $8)`,
      [
        id,
        `native-sound-${i}-${id.slice(0, 8)}`,
        'Test meaning',
        'native_sounds',
        'STOP_T',
        'tɛst',
        null,
        createdBy,
      ],
    );
    ids.push(id);
  }

  return ids;
}
