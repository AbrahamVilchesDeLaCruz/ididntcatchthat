import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';

const VALID_PASSWORD = 'Str0ng!Pass#2026';

async function registerAndLogin(
  app: INestApplication<App>,
): Promise<{ accessToken: string; refreshTokenCookie: string }> {
  const email = `e2e-refresh-${Date.now()}@test.com`;
  const nickname = `refresh${Date.now()}`.slice(0, 20);

  await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ email, password: VALID_PASSWORD, nickname });

  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password: VALID_PASSWORD });

  const setCookie = ([] as string[]).concat(
    loginRes.headers['set-cookie'] as string | string[],
  );
  const fullCookie = setCookie.find((c) => c.startsWith('refreshToken=')) ?? '';
  // Extract only the "key=value" part — Cookie header must NOT include attributes (HttpOnly, SameSite, etc.)
  const refreshTokenCookie = fullCookie.split(';')[0] ?? '';

  return {
    accessToken: (loginRes.body as { accessToken: string }).accessToken,
    refreshTokenCookie,
  };
}

describe('identity/auth RefreshAuthPostController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 200 with new accessToken and rotate the cookie', async () => {
      const { refreshTokenCookie } = await registerAndLogin(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      const body = response.body as { accessToken: string };
      expect(typeof body.accessToken).toBe('string');
      expect(body.accessToken.length).toBeGreaterThan(0);

      const setCookie = ([] as string[]).concat(
        (response.headers['set-cookie'] ?? []) as string | string[],
      );
      expect(setCookie).toBeDefined();
      expect(setCookie.some((c) => c.startsWith('refreshToken='))).toBe(true);
    });

    it('should return 401 on second use of same refresh token (token rotation)', async () => {
      const { refreshTokenCookie } = await registerAndLogin(app);

      // First use — succeeds
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      // Second use — token already rotated, all tokens revoked
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(401);
    });

    it('should return 401 when no refresh token cookie is present', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 204 and clear the cookie', async () => {
      const { accessToken, refreshTokenCookie } = await registerAndLogin(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshTokenCookie)
        .expect(204);

      const setCookie = ([] as string[]).concat(
        (response.headers['set-cookie'] ?? []) as string | string[],
      );
      expect(setCookie).toBeDefined();
      // Cookie should be cleared (Max-Age=0 or Expires in the past)
      expect(
        setCookie.some(
          (c) =>
            c.startsWith('refreshToken=') &&
            (c.includes('Max-Age=0') || c.includes('Expires=')),
        ),
      ).toBe(true);
    });

    it('should return 401 on refresh after logout', async () => {
      const { accessToken, refreshTokenCookie } = await registerAndLogin(app);

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshTokenCookie)
        .expect(204);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(401);
    });
  });
});
