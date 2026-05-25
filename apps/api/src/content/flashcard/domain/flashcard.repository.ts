import { type Criteria } from '@/shared/domain/criteria';
import { type Flashcard } from './flashcard';
import { type FlashcardId } from './flashcard-id';

export interface FlashcardRepository {
  match(criteria: Criteria): Promise<Flashcard[]>;
  count(criteria: Criteria): Promise<number>;
  search(id: FlashcardId): Promise<Flashcard | null>;
  save(flashcard: Flashcard): Promise<void>;
  saveAll(flashcards: Flashcard[]): Promise<void>;
  remove(id: FlashcardId): Promise<void>;
}

export const FLASHCARD_REPOSITORY = Symbol('FlashcardRepository');
