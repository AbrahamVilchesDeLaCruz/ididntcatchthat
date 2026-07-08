import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';
import {
  seedFlashcardDirectly,
  waitForFlashcardAudioPipeline,
} from '../shared/flashcard-e2e.helpers';

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

  describe('POST /v1/flashcards/:id/audio/regenerates', () => {
    it('should return 204 when flashcard audio status is failed', async () => {
      const id = await seedFlashcardDirectly(app, { audioStatus: 'failed' });

      await request(app.getHttpServer())
        .post(`/v1/flashcards/${id}/audio/regenerates`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await waitForFlashcardAudioPipeline(app, id);
    });

    it('should return 204 when flashcard audio status is pending', async () => {
      const id = await seedFlashcardDirectly(app, { audioStatus: 'pending' });

      await request(app.getHttpServer())
        .post(`/v1/flashcards/${id}/audio/regenerates`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await waitForFlashcardAudioPipeline(app, id);
    });

    it('should return 422 when flashcard audio status is ready', async () => {
      const id = await seedFlashcardDirectly(app, { audioStatus: 'ready' });

      await request(app.getHttpServer())
        .post(`/v1/flashcards/${id}/audio/regenerates`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(422);
    });
  });
});
