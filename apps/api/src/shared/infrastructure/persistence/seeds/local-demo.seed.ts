/**
 * Local demo seed — mirrors dev flashcards for local development.
 *
 * Fixture source: ./dev-flashcards.fixture.json
 *   - Snapshot of `flashcards` from the dev DB (Aiven Postgres + Cloudflare R2).
 *   - Regenerable by re-running the dev export query and overwriting this file.
 *   - Audio URLs point to the dev R2 public bucket — make sure
 *     http://localhost:5173 is allowed in the bucket CORS configuration.
 *
 * Audio status, examples, created_by, timestamps are all preserved from dev
 * except `created_by`, which is remapped to LOCAL_DEMO_USER_ID (no FK on this column).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as bcrypt from 'bcryptjs';
import { type DataSource } from 'typeorm';
import { type AudioUrlsPrimitives } from '@/content/flashcard/domain/audio-urls';
import { type ExamplePrimitives } from '@/content/flashcard/domain/example';

export const LOCAL_DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
export const LOCAL_DEMO_EMAIL = 'demo@local.dev';
export const LOCAL_DEMO_PASSWORD = 'DemoLocal123!';
export const LOCAL_DEMO_NICKNAME = 'demo';

const DEV_FLASHCARDS_FIXTURE_PATH = join(
  __dirname,
  'dev-flashcards.fixture.json',
);
const FLASHCARD_INSERT_CHUNK_SIZE = 100;
const FLASHCARD_INSERT_COLUMN_COUNT = 14;

type FixtureFlashcard = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioStatus: string;
  audioUrls: string | null;
  examples: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type SeedFlashcard = Omit<FixtureFlashcard, 'audioUrls' | 'examples'> & {
  audioUrls: AudioUrlsPrimitives;
  examples: ExamplePrimitives[];
  createdBy: typeof LOCAL_DEMO_USER_ID;
};

type ParsedFixture = {
  validFlashcards: SeedFlashcard[];
  skippedCount: number;
};

type FixtureLoadResult =
  | { status: 'ok'; flashcards: unknown[] }
  | { status: 'error'; error: unknown };

const devFlashcardsFixture = loadDevFlashcardsFixture()
  .then(
    (flashcards): FixtureLoadResult => ({
      status: 'ok',
      flashcards,
    }),
  )
  .catch(
    (error: unknown): FixtureLoadResult => ({
      status: 'error',
      error,
    }),
  );

export async function seedLocalDemo(dataSource: DataSource): Promise<void> {
  const existing = await dataSource.query<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM users WHERE email = $1`,
    [LOCAL_DEMO_EMAIL],
  );

  if (parseInt(existing[0]?.count ?? '0', 10) > 0) {
    process.stdout.write('Local demo seed already applied — skipping.\n');
    return;
  }

  const loadedFixture = await devFlashcardsFixture;

  if (loadedFixture.status === 'error') {
    throw toError(loadedFixture.error);
  }

  const { validFlashcards, skippedCount } = parseFixtureFlashcards(
    loadedFixture.flashcards,
  );

  const passwordHash = await bcrypt.hash(LOCAL_DEMO_PASSWORD, 12);

  await dataSource.query(
    `INSERT INTO users (
       id, email, password_hash, nickname, role, show_in_ranking,
       current_streak, longest_streak, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, 'admin', true, 0, 0, NOW(), NOW())`,
    [LOCAL_DEMO_USER_ID, LOCAL_DEMO_EMAIL, passwordHash, LOCAL_DEMO_NICKNAME],
  );

  await insertFlashcards(dataSource, validFlashcards);

  process.stdout.write(
    `Local demo seed complete: user ${LOCAL_DEMO_EMAIL} + ${validFlashcards.length} flashcards (skipped ${skippedCount} invalid).\n`,
  );
}

async function loadDevFlashcardsFixture(): Promise<unknown[]> {
  const rawFixture = await readFile(DEV_FLASHCARDS_FIXTURE_PATH, 'utf8');
  const parsedFixture: unknown = JSON.parse(rawFixture);

  if (!isRecord(parsedFixture)) {
    throw new Error(
      'Invalid dev flashcards fixture: expected flashcards array',
    );
  }

  const flashcards = parsedFixture.flashcards;

  if (!isUnknownArray(flashcards)) {
    throw new Error(
      'Invalid dev flashcards fixture: expected flashcards array',
    );
  }

  return flashcards;
}

function parseFixtureFlashcards(rawFlashcards: unknown[]): ParsedFixture {
  const validFlashcards: SeedFlashcard[] = [];
  let skippedCount = 0;

  rawFlashcards.forEach((rawFlashcard, index) => {
    const parsedFlashcard = parseFixtureFlashcard(rawFlashcard, index);

    if (parsedFlashcard === null) {
      skippedCount += 1;
      return;
    }

    validFlashcards.push(parsedFlashcard);
  });

  return { validFlashcards, skippedCount };
}

function parseFixtureFlashcard(
  rawFlashcard: unknown,
  index: number,
): SeedFlashcard | null {
  const fixtureFlashcard = toFixtureFlashcard(rawFlashcard);
  const fallbackId = fixtureFlashcard?.id ?? `fixture row ${index + 1}`;

  if (fixtureFlashcard === null) {
    warnSkippedFlashcard(fallbackId, 'invalid fixture row shape');
    return null;
  }

  const audioUrls = parseAudioUrls(fixtureFlashcard.audioUrls);

  if (audioUrls === null) {
    warnSkippedFlashcard(fixtureFlashcard.id, 'missing or invalid audio_urls');
    return null;
  }

  const examples = parseExamples(fixtureFlashcard.examples);

  if (examples === null) {
    warnSkippedFlashcard(fixtureFlashcard.id, 'invalid examples');
    return null;
  }

  return {
    ...fixtureFlashcard,
    audioUrls,
    examples,
    createdBy: LOCAL_DEMO_USER_ID,
  };
}

function toFixtureFlashcard(rawFlashcard: unknown): FixtureFlashcard | null {
  if (!isRecord(rawFlashcard)) return null;

  const id = stringOrNull(rawFlashcard.id);
  const expression = stringOrNull(rawFlashcard.expression);
  const meaning = stringOrNull(rawFlashcard.meaning);
  const category = stringOrNull(rawFlashcard.category);
  const subcategory = stringOrNull(rawFlashcard.subcategory);
  const audioStatus = stringOrNull(rawFlashcard.audio_status);
  const examples = stringOrNull(rawFlashcard.examples);
  const createdAt = stringOrNull(rawFlashcard.created_at);
  const updatedAt = stringOrNull(rawFlashcard.updated_at);

  if (
    id === null ||
    expression === null ||
    meaning === null ||
    category === null ||
    subcategory === null ||
    audioStatus === null ||
    examples === null ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null;
  }

  return {
    id,
    expression,
    meaning,
    category,
    subcategory,
    ipaNotation: nullableStringOrNull(rawFlashcard.ipa_notation),
    nativeSpeech: nullableStringOrNull(rawFlashcard.native_speech),
    audioStatus,
    audioUrls: nullableStringOrNull(rawFlashcard.audio_urls),
    examples,
    createdAt,
    updatedAt,
    deletedAt: nullableStringOrNull(rawFlashcard.deleted_at),
  };
}

function parseAudioUrls(
  rawAudioUrls: string | null,
): AudioUrlsPrimitives | null {
  if (rawAudioUrls === null || rawAudioUrls.trim() === '') return null;

  try {
    const parsedAudioUrls: unknown = JSON.parse(rawAudioUrls);

    if (!isRecord(parsedAudioUrls)) return null;
    if (!isRecord(parsedAudioUrls.expression)) return null;
    if (!isRecord(parsedAudioUrls.examples)) return null;

    const expressionUs = nonEmptyStringOrNull(parsedAudioUrls.expression.us);
    const expressionUk = nonEmptyStringOrNull(parsedAudioUrls.expression.uk);
    const expressionAu = nonEmptyStringOrNull(parsedAudioUrls.expression.au);
    const examplesUs = nonEmptyStringOrNull(parsedAudioUrls.examples.us);

    if (
      expressionUs === null ||
      expressionUk === null ||
      expressionAu === null ||
      examplesUs === null
    ) {
      return null;
    }

    return {
      expression: {
        us: expressionUs,
        uk: expressionUk,
        au: expressionAu,
      },
      examples: {
        us: examplesUs,
      },
    };
  } catch {
    return null;
  }
}

function parseExamples(rawExamples: string): ExamplePrimitives[] | null {
  try {
    const parsedExamples: unknown = JSON.parse(rawExamples);

    if (!Array.isArray(parsedExamples)) return null;

    const examples: ExamplePrimitives[] = [];

    for (const parsedExample of parsedExamples) {
      const example = toExample(parsedExample);

      if (example === null) return null;

      examples.push(example);
    }

    return examples;
  } catch {
    return null;
  }
}

function toExample(rawExample: unknown): ExamplePrimitives | null {
  if (!isRecord(rawExample)) return null;

  const id = stringOrNull(rawExample.id);
  const flashcardId = stringOrNull(rawExample.flashcardId);
  const textEn = stringOrNull(rawExample.textEn);
  const textEs = stringOrNull(rawExample.textEs);
  const position = rawExample.position;

  if (
    id === null ||
    flashcardId === null ||
    textEn === null ||
    textEs === null ||
    typeof position !== 'number'
  ) {
    return null;
  }

  return {
    id,
    flashcardId,
    textEn,
    textEs,
    position,
  };
}

async function insertFlashcards(
  dataSource: DataSource,
  flashcards: SeedFlashcard[],
): Promise<void> {
  for (const flashcardChunk of chunkArray(
    flashcards,
    FLASHCARD_INSERT_CHUNK_SIZE,
  )) {
    await insertFlashcardChunk(dataSource, flashcardChunk);
  }
}

async function insertFlashcardChunk(
  dataSource: DataSource,
  flashcards: SeedFlashcard[],
): Promise<void> {
  const values = flashcards
    .map((_, index) => buildFlashcardValuePlaceholders(index))
    .join(', ');
  const parameters = flashcards.flatMap((flashcard) => [
    flashcard.id,
    flashcard.expression,
    flashcard.meaning,
    flashcard.category,
    flashcard.subcategory,
    flashcard.ipaNotation,
    flashcard.nativeSpeech,
    flashcard.audioStatus,
    JSON.stringify(flashcard.audioUrls),
    JSON.stringify(flashcard.examples),
    flashcard.createdBy,
    flashcard.createdAt,
    flashcard.updatedAt,
    flashcard.deletedAt,
  ]);

  await dataSource.query(
    `INSERT INTO flashcards (
       id, expression, meaning, category, subcategory,
       ipa_notation, native_speech, audio_status, audio_urls, examples,
       created_by, created_at, updated_at, deleted_at
     ) VALUES ${values}`,
    parameters,
  );
}

function buildFlashcardValuePlaceholders(rowIndex: number): string {
  const offset = rowIndex * FLASHCARD_INSERT_COLUMN_COUNT;

  return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}::jsonb, $${offset + 10}::jsonb, $${offset + 11}, $${offset + 12}::timestamp, $${offset + 13}::timestamp, $${offset + 14}::timestamptz)`;
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;

  return new Error(String(error));
}

function warnSkippedFlashcard(id: string, reason: string): void {
  process.stderr.write(`Skipping fixture flashcard ${id}: ${reason}.\n`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function nullableStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.trim() === '') return null;

  return value;
}

function nonEmptyStringOrNull(value: unknown): string | null {
  return stringOrNull(value);
}
