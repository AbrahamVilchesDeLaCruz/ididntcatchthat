import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { type App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { LOGGER_SERVICE } from '../../../src/shared/domain/logger';
import { NullLogger } from '../null-logger';

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LOGGER_SERVICE)
    .useClass(NullLogger)
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();

  app.useLogger(false);
  app.setGlobalPrefix('v1', { exclude: ['/health', '/metrics'] });
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
