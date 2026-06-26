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

describe('gaming/game GetGameSummaryGetController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('GET /v1/games/:id/summary', () => {
    it('should return summary when all attempts recorded but game not completed', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken, 10);

      for (let i = 0; i < flashcardIds.length; i++) {
        await request(app.getHttpServer())
          .post(`/v1/games/${gameId}/attempts`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ flashcardId: flashcardIds[i], correct: i < 7 })
          .expect(204);
      }

      const res = await request(app.getHttpServer())
        .get(`/v1/games/${gameId}/summary`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as {
        correctCount: number;
        totalCount: number;
        accuracy: number;
      };

      expect(body.totalCount).toBe(10);
      expect(body.correctCount).toBe(7);
      expect(body.accuracy).toBe(70);
    });

    it('should return summary after game is completed', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken, 10);

      for (const flashcardId of flashcardIds) {
        await request(app.getHttpServer())
          .post(`/v1/games/${gameId}/attempts`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ flashcardId, correct: true })
          .expect(204);
      }

      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/v1/games/${gameId}/summary`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as { correctCount: number; totalCount: number };
      expect(body.totalCount).toBe(10);
      expect(body.correctCount).toBe(10);
    });

    it('should return 422 when pending attempts remain', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken, 10);

      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ flashcardId: flashcardIds[0], correct: true })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/v1/games/${gameId}/summary`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(422);
    });
  });
});
