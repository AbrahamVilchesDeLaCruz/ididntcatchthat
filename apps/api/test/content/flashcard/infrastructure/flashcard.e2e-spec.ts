import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';

const VALID_FLASHCARD = {
  id: 'f47ac10b-58cc-4372-a567-000000000001',
  expression: 'gonna',
  meaning: "Short form of 'going to'",
  category: 'connecting_words_in_speech',
  subcategory: 'WANNA_AND_GONNA',
  ipaNotation: 'ˈɡɒnə',
  nativeSpeech: null,
  examples: [
    {
      id: 'f47ac10b-58cc-4372-a567-000000000011',
      flashcardId: 'f47ac10b-58cc-4372-a567-000000000001',
      textEn: "I'm gonna be late.",
      textEs: 'Voy a llegar tarde.',
      position: 1,
    },
  ],
};

describe('content/flashcard FlashcardControllers (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  // ─── POST /flashcards ────────────────────────────────────────────────────────

  describe('POST /api/v1/flashcards', () => {
    it('should return 201 when admin creates a flashcard', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      const res = await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_FLASHCARD,
          id,
          examples: [
            { ...VALID_FLASHCARD.examples[0], id: exampleId, flashcardId: id },
          ],
        })
        .expect(201);

      const body = res.body as { id: string; expression: string };
      expect(body.id).toBe(id);
      expect(body.expression).toBe(VALID_FLASHCARD.expression);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .send(VALID_FLASHCARD)
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
        .send(VALID_FLASHCARD)
        .expect(403);
    });

    it('should return 422 when expression is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_FLASHCARD, expression: '' })
        .expect(422);
    });
  });

  // ─── GET /flashcards/:id ─────────────────────────────────────────────────────

  describe('GET /api/v1/flashcards/:id', () => {
    it('should return 200 with flashcard data when found', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_FLASHCARD,
          id,
          examples: [
            { ...VALID_FLASHCARD.examples[0], id: exampleId, flashcardId: id },
          ],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/flashcards/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as { id: string };
      expect(body.id).toBe(id);
    });

    it('should return 404 when flashcard does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/flashcards/f47ac10b-58cc-4372-a567-999999999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ─── GET /flashcards ─────────────────────────────────────────────────────────

  describe('GET /api/v1/flashcards', () => {
    it('should return 200 with paginated result', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_FLASHCARD,
          id,
          examples: [
            { ...VALID_FLASHCARD.examples[0], id: exampleId, flashcardId: id },
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

  // ─── PATCH /flashcards/:id ───────────────────────────────────────────────────

  describe('PATCH /api/v1/flashcards/:id', () => {
    it('should return 200 with updated flashcard', async () => {
      const id = crypto.randomUUID();
      const exampleId = crypto.randomUUID();

      await request(app.getHttpServer())
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...VALID_FLASHCARD,
          id,
          examples: [
            { ...VALID_FLASHCARD.examples[0], id: exampleId, flashcardId: id },
          ],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/flashcards/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ meaning: 'Updated meaning for gonna' })
        .expect(200);

      const body = res.body as { meaning: string };
      expect(body.meaning).toBe('Updated meaning for gonna');
    });

    it('should return 404 when flashcard does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/flashcards/f47ac10b-58cc-4372-a567-999999999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ meaning: 'new meaning' })
        .expect(404);
    });
  });

  // ─── POST /flashcards/bulk ───────────────────────────────────────────────────

  describe('POST /api/v1/flashcards/bulk', () => {
    it('should return 201 creating multiple flashcards atomically', async () => {
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();

      const res = await request(app.getHttpServer())
        .post('/api/v1/flashcards/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          flashcards: [
            {
              ...VALID_FLASHCARD,
              id: id1,
              examples: [
                {
                  ...VALID_FLASHCARD.examples[0],
                  id: crypto.randomUUID(),
                  flashcardId: id1,
                },
              ],
            },
            {
              ...VALID_FLASHCARD,
              id: id2,
              expression: 'wanna',
              meaning: "Short form of 'want to'",
              examples: [
                {
                  ...VALID_FLASHCARD.examples[0],
                  id: crypto.randomUUID(),
                  flashcardId: id2,
                },
              ],
            },
          ],
        })
        .expect(201);

      const body = res.body as { created: number };
      expect(body.created).toBe(2);
    });

    it('should return 422 when flashcards list is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/flashcards/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ flashcards: [] })
        .expect(422);
    });
  });
});
