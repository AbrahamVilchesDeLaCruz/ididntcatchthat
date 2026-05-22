import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('shared/health HealthGetController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['/health'] });
    await app.init();
  });

  it('GET /health — returns 200 with status ok and timestamp', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
    });
    expect(new Date(response.body.timestamp as string).toISOString()).toBe(
      response.body.timestamp,
    );
  });

  afterEach(async () => {
    await app.close();
  });
});
