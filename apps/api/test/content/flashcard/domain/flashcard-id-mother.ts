import { FlashcardId } from '@/content/flashcard/domain/flashcard-id';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class FlashcardIdMother {
  static random(): FlashcardId {
    return this.create(UuidMother.random());
  }

  static create(value: string): FlashcardId {
    return new FlashcardId(value);
  }

  static invalid(): string {
    return 'not-a-uuid';
  }
}
