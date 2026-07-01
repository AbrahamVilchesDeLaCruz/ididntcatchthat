import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../shared/infrastructure/create-admin-token';
import { registerAndLogin } from '../../progress/shared/progress-e2e.helpers';

describe('observability SearchMetricsSummaryGetController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('GET /v1/metrics/summary — returns metrics envelope for admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/metrics/summary')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data).toMatchObject({
      metrics: expect.any(Array),
    });
    expect(res.body.meta.request_id).toBeDefined();
  });

  it('GET /v1/metrics/summary — returns 403 for non-admin user', async () => {
    const userToken = await registerAndLogin(app);

    await request(app.getHttpServer())
      .get('/v1/metrics/summary')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('GET /v1/metrics/summary — returns 401 without JWT', async () => {
    await request(app.getHttpServer()).get('/v1/metrics/summary').expect(401);
  });

  it('GET /metrics — exposes Prometheus text exposition format without auth', async () => {
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('http_requests_total');
  });
});
