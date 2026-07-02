export interface FlashcardModuleQuery {
  getModule(flashcardId: string): Promise<string | null>;
}

export const FLASHCARD_MODULE_QUERY = Symbol('FlashcardModuleQuery');
