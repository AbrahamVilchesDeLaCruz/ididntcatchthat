import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '@test/shared/infrastructure/create-test-app';
import { seedNativeSoundsFlashcards } from '@test/progress/shared/seed-native-sounds-flashcards';
import {
  registerAndLogin,
  startGame,
  recordAttempts,
  waitForWeakestFlashcard,
} from '@test/progress/shared/progress-e2e.helpers';

describe('GET /progress/summary (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should return summary metrics for authenticated user', async () => {
    const token = await registerAndLogin(app);
    const { gameId, flashcardIds } = await startGame(app, token, {
      module: 'native_sounds',
      cardCount: 10,
    });
    await recordAttempts(app, token, gameId, flashcardIds, false);
    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/summary')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const data = (res.body as { data: Record<string, unknown> }).data;
    expect(data.totalAttempts).toBeGreaterThan(0);
    expect(data.gamesCompleted).toBeGreaterThanOrEqual(1);
    expect(typeof data.currentStreak).toBe('number');
  });
});

describe('POST /games source=weakest (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should start a game with weakest flashcard ids', async () => {
    const token = await registerAndLogin(app);
    const { gameId, flashcardIds } = await startGame(app, token, {
      module: 'native_sounds',
      cardCount: 10,
    });
    const wrongId = flashcardIds[0];

    for (const flashcardId of flashcardIds) {
      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${token}`)
        .send({ flashcardId, correct: flashcardId !== wrongId })
        .expect(204);
    }

    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await waitForWeakestFlashcard(app, token, wrongId);

    const res = await request(app.getHttpServer())
      .post('/v1/games')
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'game', cardCount: 10, source: 'weakest' })
      .expect(201);

    const body = res.body as { gameId: string; flashcardIds: string[] };
    expect(body.flashcardIds.length).toBeGreaterThan(0);
    expect(body.flashcardIds).toContain(wrongId);
  });
});
