import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { LEARNING_MODULES } from '@/shared/domain/learning-module';

describe('content/flashcard SearchFlashcardCatalogGetController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('GET /v1/flashcards/catalog', () => {
    it('should return 200 with catalog envelope without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/flashcards/catalog')
        .expect(200);

      expect(res.body.meta).toMatchObject({
        request_id: expect.any(String),
        timestamp: expect.any(String),
      });
      expect(res.body.data.categories).toHaveLength(LEARNING_MODULES.length);
      expect(res.body.data.categories[0]).toMatchObject({
        slug: expect.any(String),
        label: { es: expect.any(String), en: expect.any(String) },
        subcategories: expect.any(Array),
      });
    });
  });
});
