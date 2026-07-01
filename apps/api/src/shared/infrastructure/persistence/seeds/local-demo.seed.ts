import { type DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { type AudioUrlsPrimitives } from '@/content/flashcard/domain/audio-urls';
import { ConnectedSpeechSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { FlowConnectorsSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { NativeSoundsSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { RealTalkSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { LearningModule } from '@/shared/domain/learning-module';

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
    meaning: "Forma corta de 'going to'",
    category: LearningModule.ConnectedSpeech,
    subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
    ipaNotation: 'ˈɡɒnə',
  },
  {
    expression: 'wanna',
    meaning: "Forma corta de 'want to'",
    category: LearningModule.ConnectedSpeech,
    subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
    ipaNotation: 'ˈwɒnə',
  },
  {
    expression: 'gotta',
    meaning: "Forma corta de 'got to'",
    category: LearningModule.ConnectedSpeech,
    subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
    ipaNotation: 'ˈɡɒtə',
  },
  {
    expression: 'kind of',
    meaning: 'Algo; un poco',
    category: LearningModule.ConnectedSpeech,
    subcategory: ConnectedSpeechSubcategory.InformalKindOf,
    ipaNotation: 'kaɪnd əv',
  },
  {
    expression: 'sort of',
    meaning: 'Más o menos',
    category: LearningModule.ConnectedSpeech,
    subcategory: ConnectedSpeechSubcategory.InformalKindOf,
    ipaNotation: 'sɔːt əv',
  },
  {
    expression: 'water',
    meaning: 'Agua — flap T entre vocales',
    category: LearningModule.NativeSounds,
    subcategory: NativeSoundsSubcategory.TSoftBetweenVowels,
    ipaNotation: 'ˈwɔːtər',
  },
  {
    expression: 'schwa',
    meaning: 'La vocal más común del inglés',
    category: LearningModule.NativeSounds,
    subcategory: NativeSoundsSubcategory.VowelUnstressed,
    ipaNotation: 'ʃwɑː',
  },
  {
    expression: 'think',
    meaning: 'Pensar — TH sorda',
    category: LearningModule.NativeSounds,
    subcategory: NativeSoundsSubcategory.ThThink,
    ipaNotation: 'θɪŋk',
  },
  {
    expression: 'Not only... but also',
    meaning: 'No solo... sino también',
    category: LearningModule.FlowConnectors,
    subcategory: FlowConnectorsSubcategory.Addition,
    ipaNotation: 'nɒt ˈəʊnli bʌt ˈɔːlsəʊ',
  },
  {
    expression: 'Having said that',
    meaning: 'Dicho esto',
    category: LearningModule.FlowConnectors,
    subcategory: FlowConnectorsSubcategory.Contrast,
    ipaNotation: 'ˈhævɪŋ sed ðæt',
  },
  {
    expression: 'On top of that',
    meaning: 'Encima de eso',
    category: LearningModule.FlowConnectors,
    subcategory: FlowConnectorsSubcategory.Addition,
    ipaNotation: 'ɒn tɒp əv ðæt',
  },
  {
    expression: 'To be honest',
    meaning: 'Para ser honesto',
    category: LearningModule.FlowConnectors,
    subcategory: FlowConnectorsSubcategory.Emphasis,
    ipaNotation: 'tuː biː ˈɒnɪst',
  },
  {
    expression: "I'm good",
    meaning: 'Estoy bien / no necesito nada',
    category: LearningModule.RealTalk,
    subcategory: RealTalkSubcategory.CasualResponses,
    ipaNotation: 'aɪm ɡʊd',
  },
  {
    expression: 'you guys',
    meaning: 'Ustedes (informal US)',
    category: LearningModule.RealTalk,
    subcategory: RealTalkSubcategory.AddressForms,
    ipaNotation: 'juː ɡaɪz',
  },
  {
    expression: 'stuff',
    meaning: 'Cosas (vago, informal)',
    category: LearningModule.RealTalk,
    subcategory: RealTalkSubcategory.VagueNouns,
    ipaNotation: 'stʌf',
  },
  {
    expression: 'hang out',
    meaning: 'Pasar el rato',
    category: LearningModule.RealTalk,
    subcategory: RealTalkSubcategory.PhrasalVerbs,
    ipaNotation: 'hæŋ aʊt',
  },
  {
    expression: 'no worries',
    meaning: 'No pasa nada',
    category: LearningModule.RealTalk,
    subcategory: RealTalkSubcategory.CasualResponses,
    ipaNotation: 'nəʊ ˈwʌriz',
  },
  {
    expression: 'red and green',
    meaning: 'Rojo y verde — enlace',
    category: LearningModule.ConnectedSpeech,
    subcategory: ConnectedSpeechSubcategory.WordLinking,
    ipaNotation: 'red ən ɡriːn',
  },
  {
    expression: 'city',
    meaning: 'Ciudad — flap T',
    category: LearningModule.NativeSounds,
    subcategory: NativeSoundsSubcategory.TSoftBetweenVowels,
    ipaNotation: 'ˈsɪti',
  },
  {
    expression: 'Fair enough',
    meaning: 'Tiene sentido / de acuerdo',
    category: LearningModule.RealTalk,
    subcategory: RealTalkSubcategory.CasualResponses,
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
    const exampleId = crypto.randomUUID();
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
            id: exampleId,
            flashcardId: id,
            textEn: `I use "${card.expression}" all the time.`,
            textEs: `Uso "${card.expression}" todo el tiempo.`,
            position: 1,
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
