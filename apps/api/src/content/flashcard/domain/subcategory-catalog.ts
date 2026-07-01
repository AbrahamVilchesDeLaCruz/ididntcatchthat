import { type LocalizedLabel } from '@/shared/domain/learning-module';
import {
  ConnectedSpeechSubcategory,
  FlowConnectorsSubcategory,
  NativeSoundsSubcategory,
  RealTalkSubcategory,
} from '@/shared/domain/subcategory-taxonomy';

export type SubcategoryMeta = {
  label: LocalizedLabel;
  description: LocalizedLabel;
  anchorExamples: string[];
};

const meta = (
  label: LocalizedLabel,
  description: LocalizedLabel,
  anchorExamples: string[],
): SubcategoryMeta => ({ label, description, anchorExamples });

export const SUBCATEGORY_META: Record<string, SubcategoryMeta> = {
  // Native Sounds — phenomena
  [NativeSoundsSubcategory.TSoftBetweenVowels]: meta(
    {
      es: 'T suave entre vocales (water, city)',
      en: 'Soft T between vowels (water, city)',
    },
    {
      es: 'La T entre vocales suena como una D suave en inglés americano.',
      en: 'T between vowels sounds like a soft D in American English.',
    },
    ['water', 'city', 'party'],
  ),
  [NativeSoundsSubcategory.TCutAtEnd]: meta(
    {
      es: 'T cortada al final (cat, what)',
      en: 'Cut T at word end (cat, what)',
    },
    {
      es: 'La T al final de palabra o antes de consonante se corta o se glota.',
      en: 'Final T or T before a consonant is often reduced or glottalized.',
    },
    ['cat', 'what', 'it'],
  ),
  [NativeSoundsSubcategory.VowelUnstressed]: meta(
    { es: 'Vocal débil (about, the)', en: 'Unstressed vowel (about, the)' },
    {
      es: 'La schwa: la vocal más común en sílabas átonas.',
      en: 'The schwa: the most common vowel in unstressed syllables.',
    },
    ['about', 'banana', 'the'],
  ),
  // Consonants
  [NativeSoundsSubcategory.BBall]: meta(
    { es: 'B de ball', en: 'B in ball' },
    {
      es: 'Practicá la B inglesa con palabras cotidianas.',
      en: 'Practice the English B with everyday words.',
    },
    ['ball', 'bee', 'about'],
  ),
  [NativeSoundsSubcategory.ChChild]: meta(
    { es: 'CH de child', en: 'CH in child' },
    {
      es: 'El sonido CH como en child o teacher.',
      en: 'The CH sound as in child or teacher.',
    },
    ['child', 'teacher', 'watch'],
  ),
  [NativeSoundsSubcategory.DDog]: meta(
    { es: 'D de dog', en: 'D in dog' },
    {
      es: 'La D inglesa en palabras comunes.',
      en: 'The English D in common words.',
    },
    ['dog', 'ladder', 'red'],
  ),
  [NativeSoundsSubcategory.FFish]: meta(
    { es: 'F de fish', en: 'F in fish' },
    {
      es: 'La F inglesa con labio inferior contra los dientes.',
      en: 'English F with lower lip against teeth.',
    },
    ['fish', 'coffee', 'off'],
  ),
  [NativeSoundsSubcategory.GGo]: meta(
    { es: 'G de go', en: 'G in go' },
    {
      es: 'La G inglesa en palabras frecuentes.',
      en: 'The English G in frequent words.',
    },
    ['go', 'egg', 'bigger'],
  ),
  [NativeSoundsSubcategory.HHouse]: meta(
    { es: 'H de house', en: 'H in house' },
    {
      es: 'La H aspirada inglesa — no se silencia como en español.',
      en: 'Aspirated English H — not silent like in Spanish.',
    },
    ['house', 'behind', 'hello'],
  ),
  [NativeSoundsSubcategory.JJob]: meta(
    { es: 'J de job', en: 'J in job' },
    {
      es: 'El sonido J como en job o bridge.',
      en: 'The J sound as in job or bridge.',
    },
    ['job', 'bridge', 'age'],
  ),
  [NativeSoundsSubcategory.KKey]: meta(
    { es: 'K de key', en: 'K in key' },
    {
      es: 'La K inglesa en palabras comunes.',
      en: 'The English K in common words.',
    },
    ['key', 'back', 'school'],
  ),
  [NativeSoundsSubcategory.LLight]: meta(
    { es: 'L de light', en: 'L in light' },
    {
      es: 'La L inglesa con la lengua en posición clara.',
      en: 'Clear English L tongue position.',
    },
    ['light', 'play', 'feel'],
  ),
  [NativeSoundsSubcategory.MMe]: meta(
    { es: 'M de me', en: 'M in me' },
    {
      es: 'La M inglesa en palabras frecuentes.',
      en: 'The English M in frequent words.',
    },
    ['me', 'summer', 'time'],
  ),
  [NativeSoundsSubcategory.NNo]: meta(
    { es: 'N de no', en: 'N in no' },
    {
      es: 'La N inglesa en palabras comunes.',
      en: 'The English N in common words.',
    },
    ['no', 'dinner', 'sun'],
  ),
  [NativeSoundsSubcategory.NgSing]: meta(
    { es: 'NG de sing', en: 'NG in sing' },
    {
      es: 'El sonido NG al final de sílabas como en sing.',
      en: 'The NG sound at syllable end as in sing.',
    },
    ['sing', 'running', 'thing'],
  ),
  [NativeSoundsSubcategory.PPen]: meta(
    { es: 'P de pen', en: 'P in pen' },
    {
      es: 'La P inglesa con aspiración al inicio de sílaba.',
      en: 'English P with aspiration at syllable start.',
    },
    ['pen', 'happy', 'stop'],
  ),
  [NativeSoundsSubcategory.RRed]: meta(
    { es: 'R de red', en: 'R in red' },
    {
      es: 'La R americana — curva suave, no vibrante como en español.',
      en: 'American R — smooth curl, not trilled like Spanish.',
    },
    ['red', 'car', 'better'],
  ),
  [NativeSoundsSubcategory.SSit]: meta(
    { es: 'S de sit', en: 'S in sit' },
    { es: 'La S sorda inglesa.', en: 'Voiceless English S.' },
    ['sit', 'bus', 'miss'],
  ),
  [NativeSoundsSubcategory.ShShoe]: meta(
    { es: 'SH de shoe', en: 'SH in shoe' },
    {
      es: 'El sonido SH como en shoe o wash.',
      en: 'The SH sound as in shoe or wash.',
    },
    ['shoe', 'wash', 'mission'],
  ),
  [NativeSoundsSubcategory.TTime]: meta(
    { es: 'T de time', en: 'T in time' },
    { es: 'La T clara al inicio de sílaba.', en: 'Clear T at syllable start.' },
    ['time', 'table', 'stop'],
  ),
  [NativeSoundsSubcategory.ThThat]: meta(
    { es: 'TH de that (vibrante)', en: 'TH in that (voiced)' },
    {
      es: 'La TH vibrante — lengua entre dientes con vibración.',
      en: 'Voiced TH — tongue between teeth with vibration.',
    },
    ['that', 'this', 'mother'],
  ),
  [NativeSoundsSubcategory.ThThink]: meta(
    { es: 'TH de think (sorda)', en: 'TH in think (voiceless)' },
    {
      es: 'La TH sorda — lengua entre dientes sin vibración.',
      en: 'Voiceless TH — tongue between teeth without vibration.',
    },
    ['think', 'three', 'mouth'],
  ),
  [NativeSoundsSubcategory.VVacation]: meta(
    { es: 'V de vacation', en: 'V in vacation' },
    {
      es: 'La V inglesa — distinta de la B española.',
      en: 'English V — different from Spanish B.',
    },
    ['very', 'vacation', 'love'],
  ),
  [NativeSoundsSubcategory.WWe]: meta(
    { es: 'W de we', en: 'W in we' },
    {
      es: 'La W inglesa con labios redondeados.',
      en: 'English W with rounded lips.',
    },
    ['we', 'away', 'quick'],
  ),
  [NativeSoundsSubcategory.YYes]: meta(
    { es: 'Y de yes', en: 'Y in yes' },
    {
      es: 'El sonido Y como en yes o you.',
      en: 'The Y sound as in yes or you.',
    },
    ['yes', 'you', 'beyond'],
  ),
  [NativeSoundsSubcategory.ZZoo]: meta(
    { es: 'Z de zoo', en: 'Z in zoo' },
    { es: 'La Z vibrante inglesa.', en: 'Voiced English Z.' },
    ['zoo', 'buzz', 'is'],
  ),
  // Vowels
  [NativeSoundsSubcategory.VowelShortA]: meta(
    { es: 'Vocal corta (cat)', en: 'Short vowel (cat)' },
    { es: 'Vocal corta A como en cat o hat.', en: 'Short A as in cat or hat.' },
    ['cat', 'hat', 'map'],
  ),
  [NativeSoundsSubcategory.VowelLongA]: meta(
    { es: 'Vocal larga (cake)', en: 'Long vowel (cake)' },
    {
      es: 'Vocal larga A como en cake o name.',
      en: 'Long A as in cake or name.',
    },
    ['cake', 'hate', 'name'],
  ),
  [NativeSoundsSubcategory.VowelShortE]: meta(
    { es: 'Vocal corta (bed)', en: 'Short vowel (bed)' },
    { es: 'Vocal corta E como en bed o red.', en: 'Short E as in bed or red.' },
    ['bed', 'red', 'said'],
  ),
  [NativeSoundsSubcategory.VowelLongE]: meta(
    { es: 'Vocal larga (he)', en: 'Long vowel (he)' },
    { es: 'Vocal larga E como en he o see.', en: 'Long E as in he or see.' },
    ['he', 'see', 'meet'],
  ),
  [NativeSoundsSubcategory.VowelShortI]: meta(
    { es: 'Vocal corta (ship)', en: 'Short vowel (ship)' },
    {
      es: 'Vocal corta I como en ship o bit.',
      en: 'Short I as in ship or bit.',
    },
    ['ship', 'bit', 'sit'],
  ),
  [NativeSoundsSubcategory.VowelLongI]: meta(
    { es: 'Vocal larga (sheep)', en: 'Long vowel (sheep)' },
    {
      es: 'Vocal larga I como en sheep o beat.',
      en: 'Long I as in sheep or beat.',
    },
    ['sheep', 'beat', 'meet'],
  ),
  [NativeSoundsSubcategory.VowelShortO]: meta(
    { es: 'Vocal corta (got)', en: 'Short vowel (got)' },
    { es: 'Vocal corta O como en got o hot.', en: 'Short O as in got or hot.' },
    ['got', 'hot', 'stop'],
  ),
  [NativeSoundsSubcategory.VowelLongO]: meta(
    { es: 'Vocal larga (open)', en: 'Long vowel (open)' },
    {
      es: 'Vocal larga O como en open o hope.',
      en: 'Long O as in open or hope.',
    },
    ['open', 'hope', 'go'],
  ),
  [NativeSoundsSubcategory.VowelShortU]: meta(
    { es: 'Vocal corta (cut)', en: 'Short vowel (cut)' },
    { es: 'Vocal corta U como en cut o bus.', en: 'Short U as in cut or bus.' },
    ['cut', 'bus', 'love'],
  ),
  [NativeSoundsSubcategory.VowelLongU]: meta(
    { es: 'Vocal larga (food)', en: 'Long vowel (food)' },
    {
      es: 'Vocal larga U como en food o pool.',
      en: 'Long U as in food or pool.',
    },
    ['food', 'pool', 'move'],
  ),
  [NativeSoundsSubcategory.VowelULook]: meta(
    { es: 'Vocal de look', en: 'Vowel in look' },
    { es: 'Vocal como en look o book.', en: 'Vowel as in look or book.' },
    ['look', 'book', 'good'],
  ),
  [NativeSoundsSubcategory.VowelAwLaw]: meta(
    { es: 'Vocal de law', en: 'Vowel in law' },
    {
      es: 'Diptongo AW como en law o saw.',
      en: 'AW diphthong as in law or saw.',
    },
    ['law', 'saw', 'call'],
  ),
  [NativeSoundsSubcategory.VowelArCar]: meta(
    { es: 'Vocal de car', en: 'Vowel in car' },
    { es: 'Sonido AR como en car o far.', en: 'AR sound as in car or far.' },
    ['car', 'far', 'start'],
  ),
  [NativeSoundsSubcategory.VowelErBird]: meta(
    { es: 'Vocal de bird', en: 'Vowel in bird' },
    {
      es: 'Sonido ER como en bird o word.',
      en: 'ER sound as in bird or word.',
    },
    ['bird', 'word', 'turn'],
  ),
  [NativeSoundsSubcategory.VowelAirHair]: meta(
    { es: 'Vocal de hair', en: 'Vowel in hair' },
    {
      es: 'Sonido AIR como en hair o care.',
      en: 'AIR sound as in hair or care.',
    },
    ['hair', 'care', 'where'],
  ),
  [NativeSoundsSubcategory.VowelEarHear]: meta(
    { es: 'Vocal de hear', en: 'Vowel in hear' },
    {
      es: 'Sonido EAR como en hear o near.',
      en: 'EAR sound as in hear or near.',
    },
    ['hear', 'near', 'beer'],
  ),
  [NativeSoundsSubcategory.VowelOyBoy]: meta(
    { es: 'Vocal de boy', en: 'Vowel in boy' },
    {
      es: 'Diptongo OY como en boy o join.',
      en: 'OY diphthong as in boy or join.',
    },
    ['boy', 'join', 'voice'],
  ),
  [NativeSoundsSubcategory.SyllableStress]: meta(
    { es: 'Acento en la palabra', en: 'Word stress' },
    {
      es: 'Dónde cae el acento en palabras de dos o más sílabas.',
      en: 'Where stress falls in multi-syllable words.',
    },
    ['REcord', 'reCORD'],
  ),
  [NativeSoundsSubcategory.SilentLetters]: meta(
    { es: 'Letras mudas', en: 'Silent letters' },
    {
      es: 'Letras que se escriben pero no se pronuncian.',
      en: 'Letters written but not pronounced.',
    },
    ['listen', 'knife', 'doubt'],
  ),
  // Connected Speech
  [ConnectedSpeechSubcategory.InformalGoingTo]: meta(
    { es: 'Contracciones de futuro', en: 'Future contractions' },
    {
      es: 'Formas reducidas de going to, want to, got to.',
      en: 'Reduced forms of going to, want to, got to.',
    },
    ['gonna', 'wanna', 'gotta'],
  ),
  [ConnectedSpeechSubcategory.InformalKindOf]: meta(
    { es: 'Kinda / sorta', en: 'Kinda / sorta' },
    {
      es: 'Reducciones informales de kind of y sort of.',
      en: 'Informal reductions of kind of and sort of.',
    },
    ['kinda', 'sorta'],
  ),
  [ConnectedSpeechSubcategory.InformalOutOf]: meta(
    { es: 'Outta / lotta', en: 'Outta / lotta' },
    {
      es: 'Reducciones de out of y a lot of.',
      en: 'Reductions of out of and a lot of.',
    },
    ['outta', 'lotta'],
  ),
  [ConnectedSpeechSubcategory.AssimilatedYou]: meta(
    { es: 'Didja / dontcha', en: 'Didja / dontcha' },
    {
      es: 'Asimilación de sonidos en preguntas informales.',
      en: 'Sound assimilation in informal questions.',
    },
    ['didja', 'dontcha'],
  ),
  [ConnectedSpeechSubcategory.WordLinking]: meta(
    { es: 'Enlace entre palabras', en: 'Word linking' },
    {
      es: 'Cómo se conectan palabras al hablar con fluidez.',
      en: 'How words connect when speaking fluently.',
    },
    ['an apple', 'turn off'],
  ),
  [ConnectedSpeechSubcategory.DroppedConsonants]: meta(
    { es: 'Consonantes que desaparecen', en: 'Dropped consonants' },
    {
      es: 'Consonantes que se omiten en habla rápida.',
      en: 'Consonants omitted in fast speech.',
    },
    ['next day', 'most people'],
  ),
  [ConnectedSpeechSubcategory.PhraseStress]: meta(
    { es: 'Acento en frases conectadas', en: 'Stress in connected phrases' },
    {
      es: 'Dónde enfatizar en frases habladas con naturalidad.',
      en: 'Where to emphasize in naturally spoken phrases.',
    },
    ['I wanna GO'],
  ),
  // Flow & Connectors
  [FlowConnectorsSubcategory.Contrast]: meta(
    { es: 'Contraste', en: 'Contrast' },
    {
      es: 'Conectores para oponer ideas: however, on the other hand.',
      en: 'Connectors to contrast ideas: however, on the other hand.',
    },
    ['however', 'on the other hand'],
  ),
  [FlowConnectorsSubcategory.Addition]: meta(
    { es: 'Añadir ideas', en: 'Adding ideas' },
    {
      es: 'Conectores para sumar información: furthermore, in addition.',
      en: 'Connectors to add information: furthermore, in addition.',
    },
    ['furthermore', 'in addition'],
  ),
  [FlowConnectorsSubcategory.Emphasis]: meta(
    { es: 'Énfasis', en: 'Emphasis' },
    {
      es: 'Conectores para enfatizar: indeed, above all.',
      en: 'Connectors to emphasize: indeed, above all.',
    },
    ['indeed', 'above all'],
  ),
  [FlowConnectorsSubcategory.TimeSequence]: meta(
    { es: 'Tiempo y secuencia', en: 'Time and sequence' },
    {
      es: 'Conectores temporales: meanwhile, eventually.',
      en: 'Time connectors: meanwhile, eventually.',
    },
    ['meanwhile', 'eventually'],
  ),
  [FlowConnectorsSubcategory.GivingExamples]: meta(
    { es: 'Dar ejemplos', en: 'Giving examples' },
    {
      es: 'Frases para introducir ejemplos: for instance, such as.',
      en: 'Phrases to introduce examples: for instance, such as.',
    },
    ['for instance', 'such as'],
  ),
  [FlowConnectorsSubcategory.ReasonResult]: meta(
    { es: 'Causa y resultado', en: 'Reason and result' },
    {
      es: 'Conectores causales: therefore, as a result.',
      en: 'Causal connectors: therefore, as a result.',
    },
    ['therefore', 'as a result'],
  ),
  [FlowConnectorsSubcategory.Summary]: meta(
    { es: 'Resumir', en: 'Summarizing' },
    {
      es: 'Frases para cerrar o resumir: in short, to sum up.',
      en: 'Phrases to close or summarize: in short, to sum up.',
    },
    ['in short', 'to sum up'],
  ),
  [FlowConnectorsSubcategory.Meetings]: meta(
    { es: 'Reuniones', en: 'Meetings' },
    {
      es: "Expresiones útiles en reuniones: let's circle back.",
      en: "Useful meeting expressions: let's circle back.",
    },
    ["let's circle back"],
  ),
  [FlowConnectorsSubcategory.Presentations]: meta(
    { es: 'Presentaciones', en: 'Presentations' },
    {
      es: 'Frases para presentaciones: moving on to.',
      en: 'Presentation phrases: moving on to.',
    },
    ['moving on to'],
  ),
  // Real Talk
  [RealTalkSubcategory.CasualResponses]: meta(
    { es: 'Respuestas casuales', en: 'Casual responses' },
    {
      es: 'Respuestas informales del día a día.',
      en: 'Informal everyday responses.',
    },
    ["I'm good", 'no worries'],
  ),
  [RealTalkSubcategory.PhrasalVerbs]: meta(
    { es: 'Phrasal verbs', en: 'Phrasal verbs' },
    {
      es: 'Verbos compuestos muy usados en conversación.',
      en: 'Common conversational phrasal verbs.',
    },
    ['hang out', 'figure out'],
  ),
  [RealTalkSubcategory.Fillers]: meta(
    { es: 'Muletillas', en: 'Fillers' },
    {
      es: 'Muletillas naturales del habla: I mean, you know.',
      en: 'Natural speech fillers: I mean, you know.',
    },
    ['I mean', 'you know'],
  ),
  [RealTalkSubcategory.VagueNouns]: meta(
    { es: 'Sustantivos vagos', en: 'Vague nouns' },
    {
      es: 'Sustantivos genéricos del inglés hablado.',
      en: 'Generic nouns in spoken English.',
    },
    ['stuff', 'thing'],
  ),
  [RealTalkSubcategory.AddressForms]: meta(
    { es: 'Formas de dirigirse', en: 'Address forms' },
    {
      es: 'Cómo dirigirse a grupos o personas.',
      en: 'How to address groups or people.',
    },
    ['you guys', 'folks'],
  ),
  [RealTalkSubcategory.InformalSlang]: meta(
    { es: 'Slang informal', en: 'Informal slang' },
    {
      es: 'Expresiones coloquiales informales.',
      en: 'Informal colloquial expressions.',
    },
    ["ain't", 'kinda'],
  ),
  [RealTalkSubcategory.EverydayVerbs]: meta(
    { es: 'Verbos del día a día', en: 'Everyday verbs' },
    {
      es: 'Verbos muy usados en conversación cotidiana.',
      en: 'Verbs heavily used in daily conversation.',
    },
    ['grab', 'make it'],
  ),
};

export function getSubcategoryMeta(slug: string): SubcategoryMeta | undefined {
  return SUBCATEGORY_META[slug];
}
