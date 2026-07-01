import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';
import { registerAndLogin } from '../../../progress/shared/progress-e2e.helpers';

describe('identity/user SearchUserStatsGetController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
    await registerAndLogin(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should return user stats envelope for admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/users/stats?period=7d')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data).toMatchObject({
      period: '7d',
      totalUsers: expect.any(Number),
      googleUsers: expect.any(Number),
      emailUsers: expect.any(Number),
    });
    expect(res.body.meta.request_id).toBeDefined();
  });

  it('should return 403 for non-admin user', async () => {
    const userToken = await registerAndLogin(app);

    await request(app.getHttpServer())
      .get('/v1/users/stats?period=7d')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should return 422 for invalid period', async () => {
    await request(app.getHttpServer())
      .get('/v1/users/stats?period=invalid')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(422);
  });
});
