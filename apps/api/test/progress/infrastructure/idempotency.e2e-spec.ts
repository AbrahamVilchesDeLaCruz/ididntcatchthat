import { type INestApplication } from '@nestjs/common';
import { type App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../../shared/infrastructure/create-test-app';
import { GuestProgressImporter } from '@/progress/application/import/guest-progress-importer';
import { seedNativeSoundsFlashcards } from '../shared/seed-native-sounds-flashcards';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('progress/idempotency (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await seedNativeSoundsFlashcards(app, 5);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  it('should import guest progress only once for the same eventId', async () => {
    const ds = app.get(DataSource);
    const userId = UuidMother.random();
    const guestDeviceId = UuidMother.random();
    const eventId = UuidMother.random();
    const gameId = UuidMother.random();
    const flashcardRows = await ds.query<{ id: string }[]>(
      `SELECT id FROM flashcards LIMIT 2`,
    );
    const flashcardIds = flashcardRows.map((row) => row.id);

    await ds.query(
      `INSERT INTO games (id, user_id, mode, module, card_count, status, started_at)
       VALUES ($1, $2, 'game', 'native_sounds', '10', 'completed', NOW())`,
      [gameId, guestDeviceId],
    );

    for (const flashcardId of flashcardIds) {
      await ds.query(
        `INSERT INTO attempts (id, game_id, flashcard_id, correct, answered_at)
         VALUES ($1, $2, $3, false, NOW())`,
        [UuidMother.random(), gameId, flashcardId],
      );
    }

    const importer = app.get(GuestProgressImporter);

    await importer.execute({ eventId, userId, guestDeviceId });
    await importer.execute({ eventId, userId, guestDeviceId });

    const statsRows = await ds.query<{ count: string }[]>(
      `SELECT COUNT(*)::text AS count FROM user_flashcard_stats WHERE user_id = $1`,
      [userId],
    );

    expect(Number(statsRows[0].count)).toBe(2);

    const processedRows = await ds.query<{ count: string }[]>(
      `SELECT COUNT(*)::text AS count FROM processed_events WHERE event_id = $1`,
      [eventId],
    );

    expect(Number(processedRows[0].count)).toBe(1);
  });
});
