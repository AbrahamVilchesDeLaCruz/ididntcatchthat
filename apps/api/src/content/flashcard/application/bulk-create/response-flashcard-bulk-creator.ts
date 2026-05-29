import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';

export type FlashcardBulkCreatorResult = {
  created: number;
  flashcards: FlashcardPrimitives[];
};
