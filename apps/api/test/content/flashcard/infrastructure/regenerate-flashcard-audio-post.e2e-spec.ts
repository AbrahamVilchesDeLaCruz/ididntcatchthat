import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';

const VALID_PAYLOAD = {
  expression: 'gonna',
  meaning: "Short form of 'going to'",
  category: 'connected_speech',
  subcategory: 'informal_going_to',
  ipaNotation: 'ˈɡɒnə',
  nativeSpeech: null,
};

describe('content/flashcard RegenerateFlashcardAudioPostController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/flashcards/:id/regenerate-audio', () => {
    it('should return 204 when flashcard audio status is failed', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      await request(app.getHttpServer())
        .post('/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_PAYLOAD,
          id,
          examples: [
            {
              id: exampleId,
              textEn: "I'm gonna be late.",
              textEs: 'Voy a llegar tarde.',
              position: 1,
            },
          ],
        })
        .expect(201);

      const ds = app.get(DataSource);
      await ds.query(
        `UPDATE flashcards SET audio_status = 'failed' WHERE id = $1`,
        [id],
      );

      await request(app.getHttpServer())
        .post(`/v1/flashcards/${id}/regenerate-audio`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should return 422 when flashcard audio status is not failed', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      await request(app.getHttpServer())
        .post('/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_PAYLOAD,
          id,
          examples: [
            {
              id: exampleId,
              textEn: "I'm gonna be late.",
              textEs: 'Voy a llegar tarde.',
              position: 1,
            },
          ],
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/v1/flashcards/${id}/regenerate-audio`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(422);
    });
  });
});
