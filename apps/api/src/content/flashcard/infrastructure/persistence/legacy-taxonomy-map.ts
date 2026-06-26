import {
  LEARNING_MODULES,
  LearningModule,
} from '@/shared/domain/learning-module';
import { SUBCATEGORY_BY_CATEGORY } from '@/content/flashcard/domain/subcategory-catalog';

/** Categorías previas al ADR-024 → LearningModule actual. */
export const LEGACY_CATEGORY_MAP: Record<string, LearningModule> = {
  mastering_sounds: LearningModule.NativeSounds,
  connecting_words_in_speech: LearningModule.ConnectedSpeech,
  beautifying_sentences: LearningModule.FlowConnectors,
  sounding_native: LearningModule.RealTalk,
  connecting_words: LearningModule.FlowConnectors,
};

/** Subcategorías legacy (seed intermedio + enums PDF) → slug nuevo. */
export const LEGACY_SUBCATEGORY_MAP: Record<string, string> = {
  // Demo seed intermedio
  WANNA_AND_GONNA: 'informal_going_to',
  REDUCTIONS: 'informal_going_to',
  FLAP_T: 't_soft_between_vowels',
  SCHWA: 'vowel_unstressed',
  TH_SOUNDS: 'th_think',
  NOT_ONLY: 'emphasis',
  TRANSITIONS: 'time_sequence',
  DISCOURSE_MARKERS: 'addition',
  CASUAL_RESPONSES: 'casual_responses',
  CASUAL_ADDRESS: 'address_forms',
  VAGUE_NOUNS: 'vague_nouns',
  PHRASAL_VERBS: 'phrasal_verbs',
  LINKING: 'word_linking',
  // Enums legacy (PDF / import)
  FLAP_T_PARTY_CITY: 't_soft_between_vowels',
  STOP_T: 't_cut_at_end',
  THE_T_SOUND: 't_time',
  THE_B_SOUND: 'b_ball',
  THE_CH_SOUND: 'ch_child',
  THE_H_SOUND: 'h_house',
  THE_K_SOUND: 'k_key',
  THE_N_SOUND: 'n_no',
  THE_P_SOUND: 'p_pen',
  THE_R_SOUND: 'r_red',
  THE_SH_SOUND: 'sh_shoe',
  THE_SCHWA_SOUND: 'vowel_unstressed',
  THE_U_SOUND: 'vowel_u_look',
  THE_V_SOUND: 'v_vacation',
  THE_W_SOUND: 'w_we',
  THE_Z_SOUND: 'z_zoo',
  THE_A_SOUND_PART1: 'vowel_short_a',
  THE_ZH_SOUND: 'sh_shoe',
  THE_D_SOUND: 'd_dog',
  THE_J_SOUND: 'j_job',
  THE_L_SOUND: 'l_light',
  THE_S_SOUND: 's_sit',
  THE_F_SOUND: 'f_fish',
  THE_M_SOUND: 'm_me',
  THE_E_AS_IN_BED: 'vowel_short_e',
  SOUND_A_AS_IN_CAKE: 'vowel_long_a',
  SOUND_E_AS_IN_HE: 'vowel_long_e',
  SOUND_G_AS_IN_EGG: 'g_go',
  SOUND_NG_AS_IN_LONG: 'ng_sing',
  SOUND_O_AS_IN_OPEN: 'vowel_long_o',
  SOUND_O_AS_IN_GOT: 'vowel_short_o',
  SOUND_OI_AS_IN_BOY: 'vowel_oy_boy',
  SOUND_TH_AS_IN_THAT: 'th_that',
  SOUND_TH_AS_IN_THINK: 'th_think',
  SOUND_U_AS_IN_CUT: 'vowel_short_u',
  SOUND_U_AS_IN_LOOK: 'vowel_u_look',
  SOUND_U_AS_IN_FOOD: 'vowel_long_u',
  SOUND_UR_AS_IN_CURE: 'vowel_er_bird',
  SOUND_X_AS_IN_EXACT: 'k_key',
  SOUND_X_AS_IN_EXPLAIN: 'k_key',
  SOUND_Y_AS_IN_YES: 'y_yes',
  SOUND_I_AS_IN_ICE: 'vowel_long_i',
  SOUND_I_AS_IN_IT: 'vowel_short_i',
  SOUND_AR_AS_IN_CAR: 'vowel_ar_car',
  SOUND_AW_AS_IN_LAW: 'vowel_aw_law',
  SOUND_ER_AS_IN_BIRD: 'vowel_er_bird',
  SOUND_ER_AS_IN_AIR: 'vowel_air_hair',
  SOUND_EER_AS_IN_HEAR: 'vowel_ear_hear',
  BONUS: 'syllable_stress',
  BONUS_DIDJU: 'assimilated_you',
  BONUS_KISS_THE_KEYS: 'word_linking',
  BONUS_MASTERING_2_THS: 'th_think',
  BONUS_CH_SOUND: 'ch_child',
  BONUS_R: 'r_red',
  BONUS_SH: 'sh_shoe',
  BONUS_V_AND_B: 'v_vacation',
  BONUS_A_AND_U: 'vowel_short_a',
  BONUS_L_AND_R: 'l_light',
  BONUS_S_AND_Z: 's_sit',
  KINDA_SORTA: 'informal_kind_of',
  NEEDA_HAFTA_GIMME: 'informal_going_to',
  COULDA_SHOULDA: 'informal_going_to',
  DIDJU_COULDJU: 'assimilated_you',
  DONCHU_DONCHA: 'assimilated_you',
  USING_THE_SCHWA: 'vowel_unstressed',
  D_AND_T_DISAPPEAR: 'dropped_consonants',
  OUTTA: 'informal_out_of',
  GOWOUT: 'word_linking',
  TELL_IM_TELL_ER: 'word_linking',
  STRONG_GUY: 'phrase_stress',
  BONUS_WANNA_GONNA: 'informal_going_to',
  CONTRAST: 'contrast',
  ADDITION_1: 'addition',
  ADDITION_1_FURTHERMORE: 'addition',
  ADDITION_2: 'addition',
  EMPHASIS_1: 'emphasis',
  EMPHASIS_2: 'emphasis',
  EXCEPTIONS_AND_CONDITIONS: 'contrast',
  EXPLAINING_REPHRASING_GAINING_TIME: 'time_sequence',
  GIVING_EXAMPLES: 'giving_examples',
  GIVING_AN_EXAMPLE: 'giving_examples',
  MEETINGS: 'meetings',
  PRESENTATIONS: 'presentations',
  REASON_PURPOSE_AND_RESULT: 'reason_result',
  SUMMARY: 'summary',
  TIME_AND_SEQUENCE: 'time_sequence',
  DEAL_AND_OTHER_EXPRESSIONS: 'casual_responses',
  FIGURE_OUT_PRETTY: 'everyday_verbs',
  STUFF_AND_YOU_GUYS: 'address_forms',
  AINT_CUZ_POINT: 'informal_slang',
  BIG_TIME_HANG_OUT: 'phrasal_verbs',
  GOTTA_DAMN_MAKE_IT: 'informal_slang',
  GRAB_APPRECIATE: 'everyday_verbs',
  I_MEAN_MIGHT_AS_WELL: 'fillers',
  PITCH_IN_HIT_THE_SACK: 'phrasal_verbs',
  REGULAR_VERBS_PART1: 'everyday_verbs',
  REGULAR_VERBS_PART2: 'everyday_verbs',
  UHM_SO_I_MEAN: 'fillers',
};

const DEFAULT_SUBCATEGORY: Record<LearningModule, string> = {
  [LearningModule.NativeSounds]: 'v_vacation',
  [LearningModule.ConnectedSpeech]: 'informal_going_to',
  [LearningModule.FlowConnectors]: 'contrast',
  [LearningModule.RealTalk]: 'casual_responses',
};

function isValidModule(value: string): value is LearningModule {
  return LEARNING_MODULES.includes(value as LearningModule);
}

function resolveCategory(category: string): LearningModule {
  if (isValidModule(category)) return category;
  return LEGACY_CATEGORY_MAP[category] ?? LearningModule.NativeSounds;
}

function resolveSubcategory(
  module: LearningModule,
  subcategory: string,
): string {
  const valid = SUBCATEGORY_BY_CATEGORY[module];
  if (valid.has(subcategory)) return subcategory;

  const mapped = LEGACY_SUBCATEGORY_MAP[subcategory];
  if (mapped && valid.has(mapped)) return mapped;

  return DEFAULT_SUBCATEGORY[module];
}

/** Normaliza category/subcategory legacy antes de hidratar el aggregate. */
export function resolveLegacyTaxonomy(
  category: string,
  subcategory: string,
): { category: LearningModule; subcategory: string } {
  const module = resolveCategory(category);
  return {
    category: module,
    subcategory: resolveSubcategory(module, subcategory),
  };
}
