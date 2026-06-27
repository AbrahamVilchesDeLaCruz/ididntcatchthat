import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedNativeSoundsFlashcards } from '../../progress/shared/seed-native-sounds-flashcards';
import {
  registerAndLogin,
  startGame,
  recordAttempts,
  waitUntil,
  waitForUserFlashcardStatsCount,
} from '../../progress/shared/progress-e2e.helpers';

describe('ranking/search-rankings (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should return rankings and current user position when opted in', async () => {
    const token = await registerAndLogin(app);

    await request(app.getHttpServer())
      .patch('/v1/users/me/ranking-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ showInRanking: true, nickname: 'rankhero' })
      .expect(200);

    const { gameId, flashcardIds } = await startGame(app, token, {
      mode: 'game',
      cardCount: 10,
    });

    await recordAttempts(app, token, gameId, flashcardIds, true);
    await waitForUserFlashcardStatsCount(app, token, flashcardIds.length);

    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);

    await waitUntil(async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/rankings')
        .query({ type: 'most_active', period: 'all_time', limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      const body = res.body as {
        data: {
          entries: { userId: string }[];
          currentUser: { userId: string } | null;
        };
      };

      return (
        res.status === 200 &&
        body.data.entries.length > 0 &&
        body.data.currentUser !== null
      );
    });

    const res = await request(app.getHttpServer())
      .get('/v1/rankings')
      .query({ type: 'most_active', period: 'all_time', limit: 10 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as {
      data: {
        entries: {
          rank: number;
          userId: string;
          nickname: string;
          score: number;
        }[];
        currentUser: { rank: number; userId: string } | null;
      };
    };

    expect(body.data.entries.length).toBeGreaterThan(0);
    expect(body.data.currentUser?.userId).toBeDefined();
    expect(body.data.entries[0].score).toBeGreaterThanOrEqual(1);
  });
});
