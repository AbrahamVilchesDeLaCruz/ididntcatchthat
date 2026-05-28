export type PhoneticsDraft = { ipaNotation: string; nativeSpeech: string };

export interface AiPhoneticsGenerator {
  generate(expression: string): Promise<PhoneticsDraft>;
}

export const AI_PHONETICS_GENERATOR = Symbol('AiPhoneticsGenerator');
