import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedFlashcards } from '../shared/seed-flashcards';

describe('gaming/study Study flow (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should reject guest starting study mode with 403', async () => {
    const guestRes = await request(app.getHttpServer())
      .post('/v1/auth/guest')
      .send({})
      .expect(201);

    const guestToken = (guestRes.body as { accessToken: string }).accessToken;

    await request(app.getHttpServer())
      .post('/v1/games')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ mode: 'study', cardCount: 10 })
      .expect(403);
  });

  it('should complete study session via views and expose study level in progress', async () => {
    const suffix = Date.now();
    const email = `study-user-${suffix}@test.com`;

    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email,
        password: 'Str0ng!Pass#2026',
        nickname: `study${suffix}`.slice(0, 20),
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password: 'Str0ng!Pass#2026' })
      .expect(200);

    const userToken = (loginRes.body as { accessToken: string }).accessToken;

    const startRes = await request(app.getHttpServer())
      .post('/v1/games')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ mode: 'study', cardCount: 10 })
      .expect(201);

    const body = startRes.body as { gameId: string; flashcardIds: string[] };

    for (const flashcardId of body.flashcardIds) {
      await request(app.getHttpServer())
        .post(`/v1/games/${body.gameId}/views`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ flashcardId })
        .expect(204);
    }

    const completeRes = await request(app.getHttpServer())
      .post(`/v1/games/${body.gameId}/complete`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const summary = completeRes.body as {
      cardsViewed: number;
      accuracy: number;
    };
    expect(summary.cardsViewed).toBe(body.flashcardIds.length);
    expect(summary.accuracy).toBe(0);

    const modulesRes = await request(app.getHttpServer())
      .get('/v1/progress/modules')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const modules = modulesRes.body as {
      data: { studyLevel: number; studyCoverage: number }[];
    };
    expect(modules.data.length).toBe(4);
    expect(modules.data[0]).toHaveProperty('studyLevel');
    expect(modules.data[0]).toHaveProperty('studyCoverage');
  });
});
