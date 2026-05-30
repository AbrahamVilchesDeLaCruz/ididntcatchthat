import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';

export type ResponseFlashcardSearcher = {
  data: FlashcardPrimitives[];
  total: number;
  page: number;
  pageSize: number;
};
