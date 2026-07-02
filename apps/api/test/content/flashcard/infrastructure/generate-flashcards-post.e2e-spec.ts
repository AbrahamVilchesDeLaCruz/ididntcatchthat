import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { ConnectedSpeechSubcategory } from '@/shared/domain/subcategory-taxonomy';

describe('content/flashcard GenerateFlashcardsPostController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/flashcards/drafts', () => {
    it('should return 200 with drafts when admin sends valid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/flashcards/drafts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          category: CategoryValue.ConnectedSpeech,
          subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
          count: 3,
        })
        .expect(200);

      expect(res.body.meta).toMatchObject({
        request_id: expect.any(String),
        timestamp: expect.any(String),
      });
      expect(res.body.data.drafts).toHaveLength(3);
      expect(res.body.data.drafts[0]).toMatchObject({
        category: CategoryValue.ConnectedSpeech,
        subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
      });
    });

    it('should return 422 when subcategory is invalid for category', async () => {
      await request(app.getHttpServer())
        .post('/v1/flashcards/drafts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          category: CategoryValue.NativeSounds,
          subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
          count: 3,
        })
        .expect(422);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/v1/flashcards/drafts')
        .send({
          category: CategoryValue.ConnectedSpeech,
          subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
        })
        .expect(401);
    });
  });
});
