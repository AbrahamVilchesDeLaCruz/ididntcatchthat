import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '@test/shared/infrastructure/create-test-app';
import { seedNativeSoundsFlashcards } from '@test/progress/shared/seed-native-sounds-flashcards';
import {
  registerAndLogin,
  startGame,
  waitUntil,
} from '@test/progress/shared/progress-e2e.helpers';
import { ALL_ACHIEVEMENT_KEY_VALUES } from '@/achievement/shared/domain/achievement-key-values';

type AchievementItem = {
  key: string;
  category: string;
  sortOrder: number;
  unlockedAt: string | null;
};

type AchievementsEnvelope = {
  data: AchievementItem[];
  meta: { timestamp: string; request_id: string };
};

describe('GET /achievements (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should reject unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/v1/achievements').expect(401);
  });

  it('should return the full catalog with null unlockedAt for a new user', async () => {
    const token = await registerAndLogin(app);

    const res = await request(app.getHttpServer())
      .get('/v1/achievements')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as AchievementsEnvelope;

    expect(body.meta.timestamp).toBeDefined();
    expect(body.meta.request_id).toBeDefined();
    expect(body.data).toHaveLength(ALL_ACHIEVEMENT_KEY_VALUES.length);
    expect(body.data.every((item) => item.unlockedAt === null)).toBe(true);
    expect(body.data.map((item) => item.key).sort()).toEqual(
      [...ALL_ACHIEVEMENT_KEY_VALUES].sort(),
    );
  });

  it('should unlock first_game after completing a game and support since filter', async () => {
    const token = await registerAndLogin(app);
    const { gameId, flashcardIds } = await startGame(app, token, {
      mode: 'game',
      cardCount: 10,
    });

    for (let i = 0; i < flashcardIds.length; i++) {
      await request(app.getHttpServer())
        .post(`/v1/games/${gameId}/attempts`)
        .set('Authorization', `Bearer ${token}`)
        .send({ flashcardId: flashcardIds[i], correct: i > 0 })
        .expect(204);
    }
    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await waitUntil(async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/achievements')
        .set('Authorization', `Bearer ${token}`);

      if (res.status !== 200) return false;

      const firstGame = (res.body as AchievementsEnvelope).data.find(
        (item) => item.key === 'first_game',
      );

      return firstGame?.unlockedAt !== null;
    });

    const res = await request(app.getHttpServer())
      .get('/v1/achievements')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const firstGame = (res.body as AchievementsEnvelope).data.find(
      (item) => item.key === 'first_game',
    );

    expect(firstGame?.unlockedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(firstGame?.category).toBe('game');
    expect(firstGame?.sortOrder).toBe(1);

    const since = firstGame!.unlockedAt!;
    const filtered = await request(app.getHttpServer())
      .get('/v1/achievements')
      .query({ since })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect((filtered.body as AchievementsEnvelope).data).toHaveLength(1);
    expect((filtered.body as AchievementsEnvelope).data[0].key).toBe(
      'first_game',
    );
  });

  it('should return 422 for invalid since query', async () => {
    const token = await registerAndLogin(app);

    await request(app.getHttpServer())
      .get('/v1/achievements')
      .query({ since: 'not-a-date' })
      .set('Authorization', `Bearer ${token}`)
      .expect(422);
  });
});
