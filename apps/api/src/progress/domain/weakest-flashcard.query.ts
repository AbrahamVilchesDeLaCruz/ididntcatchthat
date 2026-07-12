import { type UserId } from '@/shared/domain/user-id';

export interface WeakestFlashcard {
  flashcardId: string;
  expression: string;
  /** @deprecated use category — kept for backward compatibility */
  module: string;
  category: string;
  subcategory: string;
  errorCount: number;
  lastSeenAt: string;
}

export interface WeakestFlashcardFilters {
  module?: string;
  subcategory?: string;
}

export interface WeakestFlashcardQuery {
  findWeakest(
    userId: UserId,
    filters: WeakestFlashcardFilters | undefined,
    limit: number,
    offset: number,
  ): Promise<WeakestFlashcard[]>;
  countWeakest(
    userId: UserId,
    filters: WeakestFlashcardFilters | undefined,
  ): Promise<number>;
}

export const WEAKEST_FLASHCARD_QUERY = Symbol('WeakestFlashcardQuery');
