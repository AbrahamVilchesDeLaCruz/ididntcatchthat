import {
  Controller,
  Get,
  type INestApplication,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { type App } from 'supertest/types';
import { AppModule } from '../../../../src/app.module';
import { JwtAuthGuard } from '../../../../src/shared/infrastructure/auth/jwt.guard';
import { Roles } from '../../../../src/shared/infrastructure/auth/roles.decorator';
import { RolesGuard } from '../../../../src/shared/infrastructure/auth/roles.guard';
import { LOGGER_SERVICE } from '../../../../src/shared/domain/logger';
import { NullLogger } from '../../../shared/null-logger';

// ─── Inline test controllers ─────────────────────────────────────────────────

@Controller('test-guards')
class TestGuardsController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protected(): { ok: boolean } {
    return { ok: true };
  }

  @Get('teacher-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  teacherOnly(): { ok: boolean } {
    return { ok: true };
  }

  @Get('public')
  publicEndpoint(): { ok: boolean } {
    return { ok: true };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_PASSWORD = 'Str0ng!Pass#2026';

async function createGuardsTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [TestGuardsController],
  })
    .overrideProvider(LOGGER_SERVICE)
    .useClass(NullLogger)
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();

  app.useLogger(false);

  app.setGlobalPrefix('v1', {
    exclude: ['/health', '/metrics'],
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );

  await app.init();
  return app;
}

async function registerAndGetToken(
  app: INestApplication<App>,
): Promise<string> {
  const email = `e2e-guards-${Date.now()}@test.com`;
  const nickname = `guard${Date.now()}`.slice(0, 20);

  await request(app.getHttpServer())
    .post('/v1/auth/register')
    .send({ email, password: VALID_PASSWORD, nickname });

  const loginRes = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({ email, password: VALID_PASSWORD });

  return (loginRes.body as { accessToken: string }).accessToken;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('identity/auth Guards (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createGuardsTestApp();
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('JwtAuthGuard', () => {
    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/v1/test-guards/protected')
        .expect(401);
    });

    it('should return 200 when a valid token is provided', async () => {
      const accessToken = await registerAndGetToken(app);

      await request(app.getHttpServer())
        .get('/v1/test-guards/protected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('RolesGuard', () => {
    it('should return 403 when user role is "user" but "teacher" is required', async () => {
      const accessToken = await registerAndGetToken(app);

      await request(app.getHttpServer())
        .get('/v1/test-guards/teacher-only')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('@Public endpoint', () => {
    it('should return 200 without any token', async () => {
      await request(app.getHttpServer())
        .get('/v1/test-guards/public')
        .expect(200);
    });
  });
});
