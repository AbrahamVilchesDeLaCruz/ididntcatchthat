import { type UserId } from '@/shared/domain/user-id';

export interface WeakestFlashcardDto {
  flashcardId: string;
  expression: string;
  module: string;
  errorCount: number;
  lastSeenAt: string;
}

export interface WeakestFlashcardQuery {
  findWeakest(userId: UserId, limit: number): Promise<WeakestFlashcardDto[]>;
}

export const WEAKEST_FLASHCARD_QUERY = Symbol('WeakestFlashcardQuery');
