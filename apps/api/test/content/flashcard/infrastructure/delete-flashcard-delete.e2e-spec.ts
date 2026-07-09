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

describe('content/flashcard DeleteFlashcardDeleteController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('DELETE /v1/flashcards/:id', () => {
    it('should return 204 and hide flashcard from search and find', async () => {
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
        .delete(`/v1/flashcards/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const listRes = await request(app.getHttpServer())
        .get('/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const listBody = listRes.body as { data: { id: string }[] };
      expect(listBody.data.some((item) => item.id === id)).toBe(false);

      await request(app.getHttpServer())
        .get(`/v1/flashcards/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/flashcards/${crypto.randomUUID()}`)
        .expect(401);
    });
  });
});
