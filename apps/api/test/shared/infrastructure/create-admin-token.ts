import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';

const VALID_PASSWORD = 'Str0ng!Pass#2026';

/**
 * Creates a user via API, promotes it to admin in DB, returns accessToken.
 * Used by E2E tests that require admin-protected endpoints.
 */
export async function createAdminToken(
  app: INestApplication<App>,
): Promise<string> {
  const suffix = Date.now();
  const email = `e2e-admin-${suffix}@test.com`;
  const nickname = `admin${suffix}`.slice(0, 20);

  await request(app.getHttpServer())
    .post('/v1/auth/register')
    .send({ email, password: VALID_PASSWORD, nickname })
    .expect(201);

  // Promote user to admin directly in DB
  const ds = app.get(DataSource);
  await ds.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [email]);

  const loginRes = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({ email, password: VALID_PASSWORD })
    .expect(200);

  return (loginRes.body as { accessToken: string }).accessToken;
}
