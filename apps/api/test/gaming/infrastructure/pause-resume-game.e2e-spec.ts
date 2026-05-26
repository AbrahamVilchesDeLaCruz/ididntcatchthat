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

describe('gaming/game PauseResumeGameController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('PATCH /v1/games/:id (pause)', () => {
    it('should return 204 when pausing an in-progress game', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken);

      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'paused', lastFlashcardId: flashcardIds[0] })
        .expect(204);
    });

    it('should return 404 when game does not exist', async () => {
      const guestRes = await request(app.getHttpServer())
        .post('/v1/auth/guest')
        .send({})
        .expect(200);
      const guestToken = (guestRes.body as { accessToken: string }).accessToken;

      await request(app.getHttpServer())
        .patch(`/v1/games/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ status: 'paused', lastFlashcardId: crypto.randomUUID() })
        .expect(404);
    });
  });

  describe('GET /v1/games/:id/resume', () => {
    it('should return 200 with game and pendingFlashcardIds after pausing', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId, flashcardIds } = await startGame(app, userToken);

      await request(app.getHttpServer())
        .patch(`/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'paused', lastFlashcardId: flashcardIds[0] })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/v1/games/${gameId}/resume`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as {
        game: { gameId: string };
        pendingFlashcardIds: string[];
      };

      expect(body.game.id).toBe(gameId);
      expect(Array.isArray(body.pendingFlashcardIds)).toBe(true);
    });

    it('should return 409 when game is not paused', async () => {
      const userToken = await registerAndLogin(app);
      const { gameId } = await startGame(app, userToken);

      // Game is in_progress, not paused
      await request(app.getHttpServer())
        .get(`/v1/games/${gameId}/resume`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);
    });
  });
});
