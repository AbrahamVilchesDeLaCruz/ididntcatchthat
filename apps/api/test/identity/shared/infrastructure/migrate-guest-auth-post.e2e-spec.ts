import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { seedFlashcards } from '../../../gaming/shared/seed-flashcards';
import {
  registerAndLogin,
  waitUntil,
} from '../../../progress/shared/progress-e2e.helpers';

describe('identity/auth MigrateGuestAuthPostController (e2e)', () => {
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

  it('should reassign guest games to the authenticated user', async () => {
    const guestRes = await request(app.getHttpServer())
      .post('/v1/auth/guest')
      .send({})
      .expect(200);

    const { accessToken: guestToken, deviceId: guestDeviceId } =
      guestRes.body as { accessToken: string; deviceId: string };

    const gameRes = await request(app.getHttpServer())
      .post('/v1/games')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ mode: 'game', cardCount: 5 })
      .expect(201);

    const { gameId } = (gameRes.body as { data: { gameId: string } }).data;

    const userToken = await registerAndLogin(app);

    await request(app.getHttpServer())
      .post('/v1/auth/migrate-guest')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        guestDeviceId,
        guestGames: [{ gameId }],
      })
      .expect(204);

    const ds = app.get(DataSource);
    await waitUntil(async () => {
      const rows = await ds.query<{ user_id: string | null }[]>(
        `SELECT user_id FROM games WHERE id = $1`,
        [gameId],
      );
      const userId = rows[0]?.user_id;
      return userId !== null && userId !== undefined;
    });

    const rows = await ds.query<{ user_id: string }[]>(
      `SELECT user_id FROM games WHERE id = $1`,
      [gameId],
    );
    expect(rows[0]?.user_id).toBeTruthy();
  });

  it('should return 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/migrate-guest')
      .send({
        guestDeviceId: 'guest-device-id',
        guestGames: [],
      })
      .expect(401);
  });

  it('should return 422 for invalid guest game payload', async () => {
    const token = await registerAndLogin(app);

    await request(app.getHttpServer())
      .post('/v1/auth/migrate-guest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        guestDeviceId: 'guest-device-id',
        guestGames: [{ gameId: 'not-a-uuid' }],
      })
      .expect(422);
  });
});
