import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createAdminToken } from '../../shared/infrastructure/create-admin-token';

const BASE_PAYLOAD = {
  meaning: 'Test meaning',
  category: 'mastering_sounds',
  subcategory: 'STOP_T',
  ipaNotation: 'tɛst',
  nativeSpeech: null,
  examples: [],
};

export async function seedNativeSoundsFlashcards(
  app: INestApplication<App>,
  count = 15,
): Promise<string[]> {
  const adminToken = await createAdminToken(app);
  const ids: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    await request(app.getHttpServer())
      .post('/v1/flashcards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...BASE_PAYLOAD,
        id,
        expression: `native-sound-${i}-${id.slice(0, 8)}`,
      })
      .expect(201);
    ids.push(id);
  }

  const ds = app.get(DataSource);
  // Content API stores mastering_sounds; gaming module filter expects native_sounds.
  await ds.query(
    `UPDATE flashcards
     SET audio_status = 'ready', category = 'native_sounds'
     WHERE id = ANY($1)`,
    [ids],
  );

  return ids;
}
