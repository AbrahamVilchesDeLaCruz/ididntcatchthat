import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';

describe('identity/auth GuestAuthPostController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/auth/guest', () => {
    it('should return 200 with accessToken and deviceId (no body required)', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/guest')
        .send({})
        .expect(200);

      const body = response.body as { accessToken: string; deviceId: string };

      expect(typeof body.accessToken).toBe('string');
      expect(body.accessToken.length).toBeGreaterThan(0);
      expect(typeof body.deviceId).toBe('string');
      expect(body.deviceId.length).toBeGreaterThan(0);

      const setCookie = ([] as string[]).concat(
        (response.headers['set-cookie'] ?? []) as string | string[],
      );
      expect(setCookie).toBeDefined();
      expect(setCookie.some((c) => c.startsWith('refreshToken='))).toBe(true);
    });

    it('should return 200 with optional guestDeviceId hint in body', async () => {
      // guestDeviceId is an optional hint — the server always generates its own deviceId
      const response = await request(app.getHttpServer())
        .post('/v1/auth/guest')
        .send({ guestDeviceId: 'device-e2e-hint-001' })
        .expect(200);

      const body = response.body as { accessToken: string; deviceId: string };
      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.deviceId).toBe('string');
    });

    it('should return 422 when unknown fields are sent (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/guest')
        .send({ unknownField: 'value' })
        .expect(422);
    });
  });
});
