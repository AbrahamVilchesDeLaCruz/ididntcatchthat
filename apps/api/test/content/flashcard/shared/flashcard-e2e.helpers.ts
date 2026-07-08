import { type INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { type App } from 'supertest/types';

const READY_AUDIO_URLS = {
  expression: {
    us: 'https://example.com/us.mp3',
    uk: 'https://example.com/uk.mp3',
    au: 'https://example.com/au.mp3',
  },
  examples: {
    us: 'https://example.com/ex.mp3',
  },
};

type SeedFlashcardOptions = {
  audioStatus: 'pending' | 'failed' | 'ready';
};

/**
 * Inserts a flashcard directly in the DB for content E2E.
 * Avoids POST /v1/flashcards so tests do not trigger enrich/audio async pipelines.
 */
export async function seedFlashcardDirectly(
  app: INestApplication<App>,
  options: SeedFlashcardOptions,
): Promise<string> {
  const ds = app.get(DataSource);
  const id = crypto.randomUUID();
  const exampleId = crypto.randomUUID();
  const createdBy = crypto.randomUUID();
  const examples = JSON.stringify([
    {
      id: exampleId,
      textEn: "I'm gonna be late.",
      textEs: 'Voy a llegar tarde.',
      position: 1,
    },
  ]);
  const audioUrls =
    options.audioStatus === 'ready' ? JSON.stringify(READY_AUDIO_URLS) : null;

  await ds.query(
    `INSERT INTO flashcards (
       id, expression, meaning, category, subcategory,
       ipa_notation, native_speech, audio_status, audio_urls, examples, created_by
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11)`,
    [
      id,
      'gonna',
      "Short form of 'going to'",
      'connected_speech',
      'informal_going_to',
      'ˈɡɒnə',
      null,
      options.audioStatus,
      audioUrls,
      examples,
      createdBy,
    ],
  );

  return id;
}

/**
 * Regenerate audio runs fire-and-forget; wait until stub pipeline finishes
 * before closing the Nest app (otherwise AMQP channel closes mid-publish).
 */
export async function waitForFlashcardAudioPipeline(
  app: INestApplication<App>,
  flashcardId: string,
  timeoutMs = 10_000,
): Promise<void> {
  const ds = app.get(DataSource);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const rows = await ds.query(
      `SELECT audio_status AS "audioStatus" FROM flashcards WHERE id = $1`,
      [flashcardId],
    );

    const status = rows[0]?.audioStatus;
    if (status === 'ready' || status === 'failed') {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(
    `Timed out waiting for audio pipeline on flashcard ${flashcardId}`,
  );
}
