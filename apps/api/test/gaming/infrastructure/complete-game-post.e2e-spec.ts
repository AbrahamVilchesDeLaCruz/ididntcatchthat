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

async function startGame(
  app: INestApplication<App>,
  token: string,
  cardCount = 10,
): Promise<{ gameId: string; flashcardIds: string[] }> {
  const res = await request(app.getHttpServer())
    .post('/v1/games')
    .set('Authorization', `Bearer ${token}`)
    .send({ mode: 'study', cardCount })
    .expect(201);
  return res.body as { gameId: string; flashcardIds: string[] };
}

describe('gaming/game CompleteGamePostController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/games/:id/complete', () => {
    it('should return 200 with summary when all attempts have been recorded', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken, 10);

      for (const flashcardId of flashcardIds) {
        await request(app.getHttpServer())
          .post(`/v1/games/${gameId}/attempts`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ flashcardId, correct: true })
          .expect(204);
      }

      const res = await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      const body = res.body as {
        correctCount: number;
        totalCount: number;
        accuracy: number;
        duration: number;
      };

      expect(typeof body.correctCount).toBe('number');
      expect(typeof body.totalCount).toBe('number');
      expect(body.totalCount).toBe(10);
      expect(typeof body.accuracy).toBe('number');
      expect(typeof body.duration).toBe('number');
    });

    it('should return 422 when there are pending attempts remaining', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken, 10);

      // Record only some attempts (not all)
      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ flashcardId: flashcardIds[0], correct: true })
        .expect(204);

      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(422);
    });
  });
});
