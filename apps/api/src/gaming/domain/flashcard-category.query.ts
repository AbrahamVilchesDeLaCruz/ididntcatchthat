export interface FlashcardCategoryQuery {
  findCategoryByFlashcardId(flashcardId: string): Promise<string | null>;
}

export const FLASHCARD_CATEGORY_QUERY = Symbol('FlashcardCategoryQuery');
