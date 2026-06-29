import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedFlashcards } from '../shared/seed-flashcards';

async function getGuestToken(app: INestApplication<App>): Promise<string> {
  const guestRes = await request(app.getHttpServer())
    .post('/v1/auth/guest')
    .send({})
    .expect(200);
  return (guestRes.body as { accessToken: string }).accessToken;
}

describe('gaming/game GuestLimitsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    // Clean up guest games from previous runs so the daily limit (3) is not pre-exhausted
    const ds = app.get(DataSource);
    await ds.query(`DELETE FROM games WHERE user_id IS NULL`);
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/games — guest game limits', () => {
    it('should allow guest to start up to 3 games', async () => {
      const guestToken = await getGuestToken(app);

      for (let i = 0; i < 3; i++) {
        const res = await request(app.getHttpServer())
          .post('/v1/games')
          .set('Authorization', `Bearer ${guestToken}`)
          .send({ mode: 'game', cardCount: 10 })
          .expect(201);

        const body = res.body as { gameId: string; flashcardIds: string[] };
        expect(typeof body.gameId).toBe('string');
      }
    });

    it('should return 429 when guest tries to start a 4th game', async () => {
      const guestToken = await getGuestToken(app);

      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/v1/games')
          .set('Authorization', `Bearer ${guestToken}`)
          .send({ mode: 'game', cardCount: 10 })
          .expect(201);
      }

      await request(app.getHttpServer())
        .post('/v1/games')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ mode: 'game', cardCount: 10 })
        .expect(429);
    });
  });
});
