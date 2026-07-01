import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { registerAndLogin } from '../../../progress/shared/progress-e2e.helpers';

describe('identity/user FindRankingProfileGetController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should return ranking profile envelope for authenticated user', async () => {
    const token = await registerAndLogin(app);

    const res = await request(app.getHttpServer())
      .get('/v1/users/me/ranking-profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toMatchObject({
      showInRanking: expect.any(Boolean),
      nickname: expect.any(String),
    });
    expect(res.body.meta).toMatchObject({
      timestamp: expect.any(String),
      request_id: expect.any(String),
    });
  });

  it('should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/v1/users/me/ranking-profile')
      .expect(401);
  });
});

describe('identity/user UpdateRankingProfilePatchController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should update ranking profile and return envelope', async () => {
    const token = await registerAndLogin(app);
    const nickname = `rank${Date.now()}`.slice(0, 20);

    const res = await request(app.getHttpServer())
      .patch('/v1/users/me/ranking-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ showInRanking: true, nickname })
      .expect(200);

    expect(res.body.data).toEqual({
      showInRanking: true,
      nickname,
    });
    expect(res.body.meta.request_id).toBeDefined();
  });

  it('should return 422 for invalid nickname', async () => {
    const token = await registerAndLogin(app);

    await request(app.getHttpServer())
      .patch('/v1/users/me/ranking-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ showInRanking: true, nickname: 'x' })
      .expect(422);
  });
});
