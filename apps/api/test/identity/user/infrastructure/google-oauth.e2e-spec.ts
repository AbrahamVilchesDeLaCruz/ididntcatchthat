import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';

describe('identity/auth Google OAuth routes (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('GET /auth/google/callback', () => {
    it('should not return 404 — OAuth callback is excluded from /v1 prefix', async () => {
      const response = await request(app.getHttpServer()).get(
        '/auth/google/callback',
      );

      expect(response.status).not.toBe(404);
    });
  });

  describe('GET /v1/auth/google/callback', () => {
    it('should return 404 — legacy prefixed callback is no longer registered', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/google/callback')
        .expect(404);
    });
  });
});
