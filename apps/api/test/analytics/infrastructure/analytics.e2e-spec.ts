import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '@test/shared/infrastructure/create-test-app';
import { createAdminToken } from '@test/shared/infrastructure/create-admin-token';

describe('POST /analytics/pageview (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should record a page view and return 204', async () => {
    await request(app.getHttpServer())
      .post('/v1/analytics/pageview')
      .send({
        path: '/games',
        visitorId: 'e2e-visitor-001',
        userId: null,
        referrer: null,
      })
      .expect(204);
  });

  it('should return 422 for an empty path', async () => {
    await request(app.getHttpServer())
      .post('/v1/analytics/pageview')
      .send({
        path: '',
        visitorId: 'e2e-visitor-002',
      })
      .expect(422);
  });
});

describe('GET /admin/analytics/summary (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should reject unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .get('/v1/admin/analytics/summary')
      .expect(401);
  });

  it('should return analytics summary envelope for admin', async () => {
    const token = await createAdminToken(app);

    const res = await request(app.getHttpServer())
      .get('/v1/admin/analytics/summary?period=7d')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as {
      data: {
        period: string;
        pageViews: { total: number };
        games: { total: number };
        users: { activeUsers: number };
        flashcards: { total: number };
      };
      meta: { timestamp: string; request_id: string };
    };

    expect(body.meta.timestamp).toBeDefined();
    expect(body.meta.request_id).toBeDefined();
    expect(body.data.period).toBe('7d');
    expect(body.data.pageViews.total).toBeGreaterThanOrEqual(0);
    expect(body.data.games.total).toBeGreaterThanOrEqual(0);
    expect(body.data.users.activeUsers).toBeGreaterThanOrEqual(0);
    expect(body.data.flashcards.total).toBeGreaterThanOrEqual(0);
  });
});
