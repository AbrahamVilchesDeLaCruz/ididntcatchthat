import { type FlashcardDraft } from './flashcard-draft';

export type GenerateFlashcardDraftsParams = {
  category: string;
  subcategory: string;
  count: number;
  existingExpressions: string[];
  anchorExamples: string[];
  customPrompt?: string;
};

export interface FlashcardDraftGeneratorPort {
  generate(params: GenerateFlashcardDraftsParams): Promise<FlashcardDraft[]>;
}

export const FLASHCARD_DRAFT_GENERATOR = Symbol('FlashcardDraftGenerator');
