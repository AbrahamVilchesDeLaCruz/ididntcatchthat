import { FlashcardId } from '@/shared/domain/flashcard-id';

export class ProgressFlashcardIdMother {
  static random(): FlashcardId {
    return FlashcardId.generate();
  }

  static create(value: string): FlashcardId {
    return new FlashcardId(value);
  }
}
