import { type Criteria } from '@/shared/domain/criteria';
import { type Flashcard } from './flashcard';
import { type FlashcardId } from './flashcard-id';

export interface FlashcardRepository {
  match(criteria: Criteria): Promise<Flashcard[]>;
  search(id: FlashcardId): Promise<Flashcard | null>;
  save(flashcard: Flashcard): Promise<void>;
  remove(id: FlashcardId): Promise<void>;
}

export const FLASHCARD_REPOSITORY = Symbol('FlashcardRepository');
