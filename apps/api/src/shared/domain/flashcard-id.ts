import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { FlashcardIdInvalid } from '@/shared/domain/exceptions/flashcard-id-invalid';

export class FlashcardId extends UuidValueObject {
  constructor(value: string) {
    if (!UuidValueObject.isValid(value)) {
      throw new FlashcardIdInvalid(value);
    }
    super(value);
  }

  static generate(): FlashcardId {
    return new FlashcardId(UuidValueObject.random());
  }
}
