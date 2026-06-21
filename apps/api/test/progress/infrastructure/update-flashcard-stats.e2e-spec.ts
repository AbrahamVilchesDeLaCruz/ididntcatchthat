import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { seedNativeSoundsFlashcards } from '../shared/seed-native-sounds-flashcards';
import {
  registerAndLogin,
  startGame,
  waitForWeakestFlashcard,
} from '../shared/progress-e2e.helpers';

describe('progress/update-flashcard-stats (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should update weakest flashcards after AttemptRecorded via gaming API', async () => {
    const token = await registerAndLogin(app);
    const { gameId, flashcardIds } = await startGame(app, token, {
      mode: 'game',
      cardCount: 10,
    });

    const targetFlashcardId = flashcardIds[0];

    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/attempts`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flashcardId: targetFlashcardId, correct: false })
      .expect(204);

    await waitForWeakestFlashcard(app, token, targetFlashcardId);

    const res = await request(app.getHttpServer())
      .get('/v1/progress/flashcards/weakest')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const data = (
      res.body as { data: { flashcardId: string; errorCount: number }[] }
    ).data;
    const entry = data.find((item) => item.flashcardId === targetFlashcardId);

    expect(entry).toBeDefined();
    expect(entry!.errorCount).toBeGreaterThanOrEqual(1);
  });
});
