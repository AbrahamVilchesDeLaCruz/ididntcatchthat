import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '@test/shared/infrastructure/create-test-app';
import { seedNativeSoundsFlashcards } from '@test/progress/shared/seed-native-sounds-flashcards';
import { registerAndLogin } from '@test/progress/shared/progress-e2e.helpers';

describe('progress query endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('GET /v1/progress/modules — returns envelope for authenticated user', async () => {
    const token = await registerAndLogin(app);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/modules')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.request_id).toBeDefined();
  });

  it('GET /v1/progress/subcategories — returns envelope for authenticated user', async () => {
    const token = await registerAndLogin(app);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/subcategories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.request_id).toBeDefined();
  });

  it('GET /v1/progress/flashcards/weakest — returns paginated envelope for authenticated user', async () => {
    const token = await registerAndLogin(app);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/flashcards/weakest?page=1&pageSize=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 5,
    });
    expect(res.body.meta.request_id).toBeDefined();
  });

  it('GET /v1/progress/summary — returns 401 without JWT', async () => {
    await request(app.getHttpServer()).get('/v1/progress/summary').expect(401);
  });

  it('GET /v1/progress/flashcards/weakest — returns 422 for invalid page', async () => {
    const token = await registerAndLogin(app);

    await request(app.getHttpServer())
      .get('/v1/progress/flashcards/weakest?pageSize=0')
      .set('Authorization', `Bearer ${token}`)
      .expect(422);
  });
});
