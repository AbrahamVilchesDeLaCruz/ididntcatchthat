import * as bcrypt from 'bcryptjs';
import { type DataSource } from 'typeorm';
import { type AudioUrlsPrimitives } from '@/content/flashcard/domain/audio-urls';

export const LOCAL_DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
export const LOCAL_DEMO_EMAIL = 'demo@local.dev';
export const LOCAL_DEMO_PASSWORD = 'DemoLocal123!';
export const LOCAL_DEMO_NICKNAME = 'demo';

const DEMO_AUDIO_URL =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const DEMO_AUDIO_URLS: AudioUrlsPrimitives = {
  expression: {
    us: DEMO_AUDIO_URL,
    uk: DEMO_AUDIO_URL,
    au: DEMO_AUDIO_URL,
  },
  examples: {
    us: DEMO_AUDIO_URL,
  },
};

const FLASHCARD_DEFINITIONS: Array<{
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string;
}> = [
  {
    expression: 'gonna',
    meaning: "Short form of 'going to'",
    category: 'connecting_words_in_speech',
    subcategory: 'WANNA_AND_GONNA',
    ipaNotation: 'ˈɡɒnə',
  },
  {
    expression: 'wanna',
    meaning: "Short form of 'want to'",
    category: 'connecting_words_in_speech',
    subcategory: 'WANNA_AND_GONNA',
    ipaNotation: 'ˈwɒnə',
  },
  {
    expression: 'gotta',
    meaning: "Short form of 'got to'",
    category: 'connecting_words_in_speech',
    subcategory: 'WANNA_AND_GONNA',
    ipaNotation: 'ˈɡɒtə',
  },
  {
    expression: 'kind of',
    meaning: 'Somewhat; a little',
    category: 'connecting_words_in_speech',
    subcategory: 'REDUCTIONS',
    ipaNotation: 'kaɪnd əv',
  },
  {
    expression: 'sort of',
    meaning: 'Somewhat; rather',
    category: 'connecting_words_in_speech',
    subcategory: 'REDUCTIONS',
    ipaNotation: 'sɔːt əv',
  },
  {
    expression: 'Flap T',
    meaning: 'The /t/ sound between vowels sounds like /d/',
    category: 'native_sounds',
    subcategory: 'FLAP_T',
    ipaNotation: 'flæp tiː',
  },
  {
    expression: 'schwa',
    meaning: 'The most common vowel sound in English',
    category: 'native_sounds',
    subcategory: 'SCHWA',
    ipaNotation: 'ʃwɑː',
  },
  {
    expression: '/θ/ vs /ð/',
    meaning: 'Voiceless vs voiced th sounds',
    category: 'native_sounds',
    subcategory: 'TH_SOUNDS',
    ipaNotation: 'θ ð',
  },
  {
    expression: 'Not only... but also',
    meaning: 'Emphasis structure for two related points',
    category: 'beautifying_sentences',
    subcategory: 'NOT_ONLY',
    ipaNotation: 'nɒt ˈəʊnli bʌt ˈɔːlsəʊ',
  },
  {
    expression: 'Having said that',
    meaning: 'Transition to a contrasting point',
    category: 'beautifying_sentences',
    subcategory: 'TRANSITIONS',
    ipaNotation: 'ˈhævɪŋ sed ðæt',
  },
  {
    expression: 'On top of that',
    meaning: 'Additionally; moreover',
    category: 'beautifying_sentences',
    subcategory: 'TRANSITIONS',
    ipaNotation: 'ɒn tɒp əv ðæt',
  },
  {
    expression: 'To be honest',
    meaning: 'Introducing a frank opinion',
    category: 'beautifying_sentences',
    subcategory: 'DISCOURSE_MARKERS',
    ipaNotation: 'tuː biː ˈɒnɪst',
  },
  {
    expression: "I'm good",
    meaning: "No thanks; I don't need anything",
    category: 'sounding_native',
    subcategory: 'CASUAL_RESPONSES',
    ipaNotation: 'aɪm ɡʊd',
  },
  {
    expression: 'you guys',
    meaning: 'Informal plural you (US)',
    category: 'sounding_native',
    subcategory: 'CASUAL_ADDRESS',
    ipaNotation: 'juː ɡaɪz',
  },
  {
    expression: 'stuff',
    meaning: 'Things (informal, vague)',
    category: 'sounding_native',
    subcategory: 'VAGUE_NOUNS',
    ipaNotation: 'stʌf',
  },
  {
    expression: 'hang out',
    meaning: 'Spend time socially',
    category: 'sounding_native',
    subcategory: 'PHRASAL_VERBS',
    ipaNotation: 'hæŋ aʊt',
  },
  {
    expression: 'no worries',
    meaning: "It's fine; don't mention it",
    category: 'sounding_native',
    subcategory: 'CASUAL_RESPONSES',
    ipaNotation: 'nəʊ ˈwʌriz',
  },
  {
    expression: 'red and green',
    meaning: 'Connected speech example with flap T',
    category: 'connecting_words_in_speech',
    subcategory: 'LINKING',
    ipaNotation: 'red ən ɡriːn',
  },
  {
    expression: 'water bottle',
    meaning: 'Flap T in American English',
    category: 'native_sounds',
    subcategory: 'FLAP_T',
    ipaNotation: 'ˈwɔːtər ˈbɒtl',
  },
  {
    expression: 'Fair enough',
    meaning: 'Accepting a reasonable point',
    category: 'sounding_native',
    subcategory: 'CASUAL_RESPONSES',
    ipaNotation: 'feər ɪˈnʌf',
  },
];

export async function seedLocalDemo(dataSource: DataSource): Promise<void> {
  const existing = await dataSource.query<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM users WHERE email = $1`,
    [LOCAL_DEMO_EMAIL],
  );

  if (parseInt(existing[0]?.count ?? '0', 10) > 0) {
    process.stdout.write('Local demo seed already applied — skipping.\n');
    return;
  }

  const passwordHash = await bcrypt.hash(LOCAL_DEMO_PASSWORD, 12);

  await dataSource.query(
    `INSERT INTO users (
       id, email, password_hash, nickname, role, show_in_ranking,
       current_streak, longest_streak, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, 'admin', true, 0, 0, NOW(), NOW())`,
    [LOCAL_DEMO_USER_ID, LOCAL_DEMO_EMAIL, passwordHash, LOCAL_DEMO_NICKNAME],
  );

  for (const card of FLASHCARD_DEFINITIONS) {
    const id = crypto.randomUUID();
    await dataSource.query(
      `INSERT INTO flashcards (
         id, expression, meaning, category, subcategory,
         ipa_notation, native_speech, audio_status, audio_urls, examples, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ready', $8::jsonb, $9::jsonb, $10)`,
      [
        id,
        card.expression,
        card.meaning,
        card.category,
        card.subcategory,
        card.ipaNotation,
        card.expression,
        JSON.stringify(DEMO_AUDIO_URLS),
        JSON.stringify([
          {
            textEn: `I use "${card.expression}" all the time.`,
            textEs: `Uso "${card.expression}" todo el tiempo.`,
          },
        ]),
        LOCAL_DEMO_USER_ID,
      ],
    );
  }

  process.stdout.write(
    `Local demo seed complete: user ${LOCAL_DEMO_EMAIL} + ${FLASHCARD_DEFINITIONS.length} flashcards.\n`,
  );
}
