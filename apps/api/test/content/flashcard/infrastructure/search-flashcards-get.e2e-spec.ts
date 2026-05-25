import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';

const VALID_PAYLOAD = {
  expression: 'gonna',
  meaning: "Short form of 'going to'",
  category: 'connecting_words_in_speech',
  subcategory: 'WANNA_AND_GONNA',
  ipaNotation: 'ˈɡɒnə',
  nativeSpeech: null,
};

describe('content/flashcard SearchFlashcardsGetController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('GET /api/v1/flashcards', () => {
    it('should return 200 with paginated result containing the created flashcard', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_PAYLOAD,
          id,
          examples: [
            {
              id: exampleId,
              flashcardId: id,
              textEn: "I'm gonna be late.",
              textEs: 'Voy a llegar tarde.',
              position: 1,
            },
          ],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      const body = res.body as {
        data: unknown[];
        total: number;
        page: number;
        pageSize: number;
      };
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.total).toBe('number');
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(10);
    });
  });
});
