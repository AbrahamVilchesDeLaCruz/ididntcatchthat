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

async function startAndPauseGame(
  app: INestApplication<App>,
  token: string,
): Promise<void> {
  const res = await request(app.getHttpServer())
    .post('/v1/games')
    .set('Authorization', `Bearer ${token}`)
    .send({ mode: 'game', cardCount: 10 })
    .expect(201);

  const { gameId, flashcardIds } = res.body as {
    gameId: string;
    flashcardIds: string[];
  };

  await request(app.getHttpServer())
    .patch(`/v1/games/${gameId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'paused', lastFlashcardId: flashcardIds[0] })
    .expect(204);
}

describe('gaming/game MaxPausedGamesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/games — max paused games enforcement', () => {
    it('should return 409 after reaching 5 paused games', async () => {
      const userToken = await registerAndLogin(app);

      // Pause 5 games
      for (let i = 0; i < 5; i++) {
        await startAndPauseGame(app, userToken);
      }

      // 6th start should be rejected
      await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mode: 'game', cardCount: 10 })
        .expect(409);
    });

    it('should allow starting a new game after abandoning one paused game', async () => {
      const userToken = await registerAndLogin(app);

      const pausedGameIds: string[] = [];

      // Pause 5 games, track IDs
      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/v1/games')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ mode: 'game', cardCount: 10 })
          .expect(201);

        const { gameId, flashcardIds } = res.body as {
          gameId: string;
          flashcardIds: string[];
        };

        await request(app.getHttpServer())
          .patch(`/v1/games/${gameId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'paused', lastFlashcardId: flashcardIds[0] })
          .expect(204);

        pausedGameIds.push(gameId);
      }

      // Abandon one
      await request(app.getHttpServer())
        .patch(`/v1/games/${pausedGameIds[0]}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'abandoned' })
        .expect(204);

      // Now we should be able to start a new game
      await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mode: 'game', cardCount: 10 })
        .expect(201);
    });
  });
});
