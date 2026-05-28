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
): Promise<{ gameId: string; flashcardIds: string[] }> {
  const res = await request(app.getHttpServer())
    .post('/v1/games')
    .set('Authorization', `Bearer ${token}`)
    .send({ mode: 'study', cardCount: 10 })
    .expect(201);
  return res.body as { gameId: string; flashcardIds: string[] };
}

describe('gaming/game AbandonGameController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('PATCH /v1/games/:id (abandon)', () => {
    it('should return 204 when abandoning an in-progress game', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId } = await startGame(app, userToken);

      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'abandoned' })
        .expect(204);
    });

    it('should return 204 when abandoning a paused game', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken);

      // Pause first
      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'paused', lastFlashcardId: flashcardIds[0] })
        .expect(204);

      // Then abandon
      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'abandoned' })
        .expect(204);
    });

    it('should return 409 when abandoning a completed game', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken);

      // Record all attempts
      for (const flashcardId of flashcardIds) {
        await request(app.getHttpServer())
          .post(`/v1/games/${gameId}/attempts`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ flashcardId, correct: true })
          .expect(204);
      }

      // Complete game
      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      // Try to abandon completed game
      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'abandoned' })
        .expect(409);
    });
  });
});
