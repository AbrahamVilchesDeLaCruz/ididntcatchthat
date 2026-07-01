import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../shared/infrastructure/create-admin-token';

describe('gaming/game SearchGamesStatsGetController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('GET /v1/games/stats', () => {
    it('should return 200 with stats envelope for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/games/stats')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.meta).toMatchObject({
        request_id: expect.any(String),
        timestamp: expect.any(String),
      });
      expect(res.body.data).toMatchObject({
        period: '7d',
        totalGames: expect.any(Number),
        completedGames: expect.any(Number),
      });
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/v1/games/stats')
        .query({ period: '7d' })
        .expect(401);
    });
  });
});
