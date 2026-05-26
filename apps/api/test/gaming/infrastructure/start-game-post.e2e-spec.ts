import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedFlashcards } from '../shared/seed-flashcards';

describe('gaming/game StartGamePostController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    const ds = app.get(DataSource);
    await ds.query(`DELETE FROM games WHERE user_id IS NULL`);
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/games', () => {
    it('should return 201 with gameId and flashcardIds when user sends valid payload', async () => {
      const suffix = Date.now();
      const email = `e2e-user-${suffix}@test.com`;
      const nickname = `user${suffix}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email, password: 'Str0ng!Pass#2026', nickname })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email, password: 'Str0ng!Pass#2026' })
        .expect(200);
      const userToken = (loginRes.body as { accessToken: string }).accessToken;

      const res = await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mode: 'study', cardCount: 10 })
        .expect(201);

      const body = res.body as { gameId: string; flashcardIds: string[] };
      expect(typeof body.gameId).toBe('string');
      expect(Array.isArray(body.flashcardIds)).toBe(true);
      expect(body.flashcardIds.length).toBeGreaterThan(0);
    });

    it('should return 201 when guest token is used', async () => {
      const guestRes = await request(app.getHttpServer())
        .post('/v1/auth/guest')
        .send({})
        .expect(200);
      const guestToken = (guestRes.body as { accessToken: string }).accessToken;

      const res = await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ mode: 'study', cardCount: 10 })
        .expect(201);

      const body = res.body as { gameId: string; flashcardIds: string[] };
      expect(typeof body.gameId).toBe('string');
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/v1/games')
        .send({ mode: 'study', cardCount: 10 })
        .expect(401);
    });

    it('should return 422 when mode is invalid', async () => {
      const suffix = Date.now();
      const email = `e2e-user-${suffix}@test.com`;
      const nickname = `user${suffix}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email, password: 'Str0ng!Pass#2026', nickname })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email, password: 'Str0ng!Pass#2026' })
        .expect(200);
      const userToken = (loginRes.body as { accessToken: string }).accessToken;

      await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mode: 'invalid_mode', cardCount: 10 })
        .expect(422);
    });
  });
});
