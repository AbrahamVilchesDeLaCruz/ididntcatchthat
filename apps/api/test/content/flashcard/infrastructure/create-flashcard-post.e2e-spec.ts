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

describe('content/flashcard CreateFlashcardPostController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /api/v1/flashcards', () => {
    it('should return 201 with created flashcard when admin sends valid payload', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      const res = await request(app.getHttpServer())
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

      const body = res.body as { id: string; expression: string };
      expect(body.id).toBe(id);
      expect(body.expression).toBe(VALID_PAYLOAD.expression);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .send({
          ...VALID_PAYLOAD,
          id: crypto.randomUUID(),
          examples: [],
        })
        .expect(401);
    });

    it('should return 403 when user is not admin', async () => {
      const suffix = Date.now();
      const email = `e2e-user-${suffix}@test.com`;
      const nickname = `user${suffix}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: 'Str0ng!Pass#2026', nickname })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'Str0ng!Pass#2026' })
        .expect(200);

      const userToken = (loginRes.body as { accessToken: string }).accessToken;

      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...VALID_PAYLOAD,
          id: crypto.randomUUID(),
          examples: [],
        })
        .expect(403);
    });

    it('should return 422 when expression is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_PAYLOAD,
          id: crypto.randomUUID(),
          expression: '',
          examples: [],
        })
        .expect(422);
    });
  });
});
