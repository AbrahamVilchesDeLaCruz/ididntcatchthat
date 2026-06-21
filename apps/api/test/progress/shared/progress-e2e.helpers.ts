import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';

export async function registerAndLogin(
  app: INestApplication<App>,
): Promise<string> {
  const suffix = Date.now() + Math.floor(Math.random() * 10000);
  const email = `e2e-progress-${suffix}@test.com`;
  const nickname = `prog${suffix}`.slice(0, 20);

  await request(app.getHttpServer())
    .post('/v1/auth/register')
    .send({ email, password: 'Str0ng!Pass#2026', nickname })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({ email, password: 'Str0ng!Pass#2026' })
    .expect(200);

  return (loginRes.body as { accessToken: string }).accessToken;
}

export async function startGame(
  app: INestApplication<App>,
  token: string,
  options?: {
    mode?: 'study' | 'game';
    module?: string;
    cardCount?: number;
  },
): Promise<{ gameId: string; flashcardIds: string[] }> {
  const res = await request(app.getHttpServer())
    .post('/v1/games')
    .set('Authorization', `Bearer ${token}`)
    .send({
      mode: options?.mode ?? 'game',
      module: options?.module,
      cardCount: options?.cardCount ?? 10,
    })
    .expect(201);

  return res.body as { gameId: string; flashcardIds: string[] };
}

export async function recordAttempts(
  app: INestApplication<App>,
  token: string,
  gameId: string,
  flashcardIds: string[],
  correct: boolean,
): Promise<void> {
  for (const flashcardId of flashcardIds) {
    await request(app.getHttpServer())
      .post(`/v1/games/${gameId}/attempts`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flashcardId, correct })
      .expect(204);
  }
}

export async function waitUntil(
  predicate: () => Promise<boolean>,
  options?: { timeoutMs?: number; intervalMs?: number },
): Promise<void> {
  const defaultTimeout = process.env.CI === 'true' ? 60_000 : 10_000;
  const timeoutMs = options?.timeoutMs ?? defaultTimeout;
  const intervalMs = options?.intervalMs ?? 200;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('waitUntil timed out');
}

export async function waitForUserFlashcardStatsCount(
  app: INestApplication<App>,
  token: string,
  minCount: number,
): Promise<void> {
  await waitUntil(async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/progress/flashcards/weakest')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const data = (res.body as { data: unknown[] }).data;
    return data.length >= minCount;
  });
}

export async function waitForWeakestFlashcard(
  app: INestApplication<App>,
  token: string,
  flashcardId: string,
): Promise<void> {
  await waitUntil(async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/progress/flashcards/weakest')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const data = (res.body as { data: { flashcardId: string }[] }).data;
    return data.some((item) => item.flashcardId === flashcardId);
  });
}

export async function waitForModuleMasteryLevel(
  app: INestApplication<App>,
  token: string,
  module: string,
  masteryLevel: number,
): Promise<void> {
  await waitUntil(async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/progress/modules')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const data = (
      res.body as { data: { module: string; masteryLevel: number }[] }
    ).data;
    const entry = data.find((item) => item.module === module);
    return entry?.masteryLevel === masteryLevel;
  });
}
