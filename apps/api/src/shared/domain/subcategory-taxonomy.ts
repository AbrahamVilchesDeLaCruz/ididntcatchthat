import { LearningModule } from '@/shared/domain/learning-module';
// ─── Native Sounds ────────────────────────────────────────────────────────────

export enum NativeSoundsSubcategory {
  TSoftBetweenVowels = 't_soft_between_vowels',
  TCutAtEnd = 't_cut_at_end',
  VowelUnstressed = 'vowel_unstressed',
  BBall = 'b_ball',
  ChChild = 'ch_child',
  DDog = 'd_dog',
  FFish = 'f_fish',
  GGo = 'g_go',
  HHouse = 'h_house',
  JJob = 'j_job',
  KKey = 'k_key',
  LLight = 'l_light',
  MMe = 'm_me',
  NNo = 'n_no',
  NgSing = 'ng_sing',
  PPen = 'p_pen',
  RRed = 'r_red',
  SSit = 's_sit',
  ShShoe = 'sh_shoe',
  TTime = 't_time',
  ThThat = 'th_that',
  ThThink = 'th_think',
  VVacation = 'v_vacation',
  WWe = 'w_we',
  YYes = 'y_yes',
  ZZoo = 'z_zoo',
  VowelShortA = 'vowel_short_a',
  VowelLongA = 'vowel_long_a',
  VowelShortE = 'vowel_short_e',
  VowelLongE = 'vowel_long_e',
  VowelShortI = 'vowel_short_i',
  VowelLongI = 'vowel_long_i',
  VowelShortO = 'vowel_short_o',
  VowelLongO = 'vowel_long_o',
  VowelShortU = 'vowel_short_u',
  VowelLongU = 'vowel_long_u',
  VowelULook = 'vowel_u_look',
  VowelAwLaw = 'vowel_aw_law',
  VowelArCar = 'vowel_ar_car',
  VowelErBird = 'vowel_er_bird',
  VowelAirHair = 'vowel_air_hair',
  VowelEarHear = 'vowel_ear_hear',
  VowelOyBoy = 'vowel_oy_boy',
  SyllableStress = 'syllable_stress',
  SilentLetters = 'silent_letters',
}

// ─── Connected Speech ─────────────────────────────────────────────────────────

export enum ConnectedSpeechSubcategory {
  InformalGoingTo = 'informal_going_to',
  InformalKindOf = 'informal_kind_of',
  InformalOutOf = 'informal_out_of',
  AssimilatedYou = 'assimilated_you',
  WordLinking = 'word_linking',
  DroppedConsonants = 'dropped_consonants',
  PhraseStress = 'phrase_stress',
}

// ─── Flow & Connectors ────────────────────────────────────────────────────────

export enum FlowConnectorsSubcategory {
  Contrast = 'contrast',
  Addition = 'addition',
  Emphasis = 'emphasis',
  TimeSequence = 'time_sequence',
  GivingExamples = 'giving_examples',
  ReasonResult = 'reason_result',
  Summary = 'summary',
  Meetings = 'meetings',
  Presentations = 'presentations',
}

// ─── Real Talk ────────────────────────────────────────────────────────────────

export enum RealTalkSubcategory {
  CasualResponses = 'casual_responses',
  PhrasalVerbs = 'phrasal_verbs',
  Fillers = 'fillers',
  VagueNouns = 'vague_nouns',
  AddressForms = 'address_forms',
  InformalSlang = 'informal_slang',
  EverydayVerbs = 'everyday_verbs',
}

export const SUBCATEGORY_BY_CATEGORY: Record<LearningModule, Set<string>> = {
  [LearningModule.NativeSounds]: new Set(
    Object.values(NativeSoundsSubcategory),
  ),
  [LearningModule.ConnectedSpeech]: new Set(
    Object.values(ConnectedSpeechSubcategory),
  ),
  [LearningModule.FlowConnectors]: new Set(
    Object.values(FlowConnectorsSubcategory),
  ),
  [LearningModule.RealTalk]: new Set(Object.values(RealTalkSubcategory)),
};

export function isValidSubcategoryForCategory(
  category: LearningModule,
  subcategory: string,
): boolean {
  return SUBCATEGORY_BY_CATEGORY[category]?.has(subcategory) ?? false;
}
