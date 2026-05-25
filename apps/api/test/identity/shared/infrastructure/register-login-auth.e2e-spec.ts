import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';

const VALID_EMAIL = `e2e-register-${Date.now()}@test.com`;
const VALID_NICKNAME = `e2euser${Date.now()}`.slice(0, 20);
const VALID_PASSWORD = 'Str0ng!Pass#2026';

describe('identity/auth RegisterAuthPostController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /v1/auth/register', () => {
    it('should return 201 on successful registration', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
          nickname: VALID_NICKNAME,
        })
        .expect(201);
    });

    it('should return 409 when email is already taken', async () => {
      const email = `e2e-dup-email-${Date.now()}@test.com`;
      const nickname = `dupnick${Date.now()}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email, password: VALID_PASSWORD, nickname })
        .expect(201);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email,
          password: VALID_PASSWORD,
          nickname: `other${Date.now()}`.slice(0, 20),
        })
        .expect(409);
    });

    it('should return 409 when nickname is already taken', async () => {
      const nickname = `dupnick${Date.now()}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: `e2e-nick1-${Date.now()}@test.com`,
          password: VALID_PASSWORD,
          nickname,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: `e2e-nick2-${Date.now()}@test.com`,
          password: VALID_PASSWORD,
          nickname,
        })
        .expect(409);
    });

    it('should return 422 when password is too weak', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: `e2e-weak-${Date.now()}@test.com`,
          password: '123',
          nickname: `weakpass${Date.now()}`.slice(0, 20),
        })
        .expect(422);
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should return 200 with accessToken on valid credentials', async () => {
      const email = `e2e-login-${Date.now()}@test.com`;
      const nickname = `login${Date.now()}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email, password: VALID_PASSWORD, nickname })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email, password: VALID_PASSWORD })
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

    it('should return 401 with same message for wrong email', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: VALID_PASSWORD })
        .expect(401);

      const body = response.body as { message: string };
      expect(typeof body.message).toBe('string');
    });

    it('should return 401 with same message for wrong password', async () => {
      const email = `e2e-wrongpw-${Date.now()}@test.com`;
      const nickname = `wrongpw${Date.now()}`.slice(0, 20);

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email, password: VALID_PASSWORD, nickname })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email, password: 'WrongPass!999' })
        .expect(401);

      const body = response.body as { message: string };
      expect(typeof body.message).toBe('string');
    });
  });
});
