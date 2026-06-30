import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedNativeSoundsFlashcards } from '../shared/seed-native-sounds-flashcards';
import {
  registerAndLogin,
  startGame,
  waitForModuleMasteryLevel,
  waitForUserFlashcardStatsCount,
} from '../shared/progress-e2e.helpers';

describe('progress/update-module-progress (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should reach mastery level 1 after a completed module game', async () => {
    const token = await registerAndLogin(app);
    const { gameId, flashcardIds } = await startGame(app, token, {
      mode: 'game',
      module: 'native_sounds',
      cardCount: 10,
    });

    for (let i = 0; i < flashcardIds.length; i++) {
      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${token}`)
        .send({ flashcardId: flashcardIds[i], correct: i < 5 })
        .expect(204);
    }

    await waitForUserFlashcardStatsCount(app, token, flashcardIds.length);

    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);

    await waitForModuleMasteryLevel(app, token, 'native_sounds', 1);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/modules')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const entry = (
      res.body as {
        data: { module: string; masteryLevel: number; totalAttempts: number }[];
      }
    ).data.find((item) => item.module === 'native_sounds');

    expect(entry).toBeDefined();
    expect(entry!.masteryLevel).toBe(1);
    expect(entry!.totalAttempts).toBe(10);
  });

  it('should reach mastery level 1 after a completed random game', async () => {
    const token = await registerAndLogin(app);
    const { gameId, flashcardIds } = await startGame(app, token, {
      mode: 'game',
      module: null,
      cardCount: 10,
    });

    for (let i = 0; i < flashcardIds.length; i++) {
      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${token}`)
        .send({ flashcardId: flashcardIds[i], correct: true })
        .expect(204);
    }

    await waitForUserFlashcardStatsCount(app, token, flashcardIds.length);

    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);

    await waitForModuleMasteryLevel(app, token, 'native_sounds', 1);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/modules')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const entry = (
      res.body as {
        data: { module: string; masteryLevel: number; totalAttempts: number }[];
      }
    ).data.find((item) => item.module === 'native_sounds');

    expect(entry).toBeDefined();
    expect(entry!.masteryLevel).toBe(1);
    expect(entry!.totalAttempts).toBe(10);
  });
});
