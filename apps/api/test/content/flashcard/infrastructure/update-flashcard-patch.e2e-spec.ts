import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
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

describe('content/flashcard UpdateFlashcardPatchController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('PATCH /v1/flashcards/:id', () => {
    it('should return 200 with updated flashcard when it exists', async () => {
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

      const res = await request(app.getHttpServer())
        .patch(`/v1/flashcards/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ meaning: 'Updated meaning for gonna' })
        .expect(200);

      const body = res.body as { meaning: string };
      expect(body.meaning).toBe('Updated meaning for gonna');
    });

    it('should return 404 when flashcard does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/v1/flashcards/f47ac10b-58cc-4372-a567-999999999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ meaning: 'new meaning' })
        .expect(404);
    });
  });
});
