import { type ExampleDraft } from './ai-example-generator';

export type FlashcardDraft = {
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: ExampleDraft[];
};
