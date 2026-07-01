import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';
import { CategoryValue } from '@/content/flashcard/domain/category';

describe('content/flashcard SuggestExamplesPostController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/flashcards/example-suggestions', () => {
    it('should return 200 with examples envelope when admin sends valid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/flashcards/example-suggestions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          expression: 'gonna',
          category: CategoryValue.ConnectedSpeech,
        })
        .expect(200);

      expect(res.body.meta).toMatchObject({
        request_id: expect.any(String),
        timestamp: expect.any(String),
      });
      expect(res.body.data.examples.length).toBeGreaterThan(0);
      expect(res.body.data.examples[0]).toMatchObject({
        textEn: expect.any(String),
        textEs: expect.any(String),
      });
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/v1/flashcards/example-suggestions')
        .send({
          expression: 'gonna',
          category: CategoryValue.ConnectedSpeech,
        })
        .expect(401);
    });
  });
});
