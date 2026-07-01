import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedFlashcards } from '../shared/seed-flashcards';

async function registerAndLogin(app: INestApplication<App>): Promise<string> {
  const suffix = Date.now() + Math.floor(Math.random() * 10000);
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

  return (loginRes.body as { accessToken: string }).accessToken;
}

describe('gaming/game SearchGamesGetController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('GET /v1/games?status=paused', () => {
    it('should return 200 with paused games envelope', async () => {
      const userToken = await registerAndLogin(app);

      const startRes = await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mode: 'game', cardCount: 10 })
        .expect(201);

      const { gameId, flashcardIds } = (
        startRes.body as {
          data: { gameId: string; flashcardIds: string[] };
        }
      ).data;

      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'paused', lastFlashcardId: flashcardIds[0] })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get('/v1/games')
        .query({ status: 'paused' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.meta).toMatchObject({
        request_id: expect.any(String),
        timestamp: expect.any(String),
      });
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: gameId, status: 'paused' }),
        ]),
      );
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/v1/games')
        .query({ status: 'paused' })
        .expect(401);
    });
  });
});
