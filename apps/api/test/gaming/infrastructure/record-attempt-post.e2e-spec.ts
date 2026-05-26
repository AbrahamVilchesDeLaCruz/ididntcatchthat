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

describe('gaming/game RecordAttemptPostController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/games/:id/attempts', () => {
    it('should return 204 when recording a valid attempt', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken);

      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ flashcardId: flashcardIds[0], correct: true })
        .expect(204);
    });

    it('should return 404 when game does not exist', async () => {
      const userToken = await registerAndLogin(app);

      await request(app.getHttpServer())
        .post(`/v1/games/${crypto.randomUUID()}/attempts`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ flashcardId: crypto.randomUUID(), correct: true })
        .expect(404);
    });

    it("should return 403 when accessing another user's game", async () => {
      const ownerToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, ownerToken);

      const otherToken = await registerAndLogin(app);

      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ flashcardId: flashcardIds[0], correct: true })
        .expect(403);
    });

    it('should return 422 when flashcard is not in the game', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId } = await startGame(app, userToken);

      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ flashcardId: crypto.randomUUID(), correct: true })
        .expect(422);
    });
  });
});
