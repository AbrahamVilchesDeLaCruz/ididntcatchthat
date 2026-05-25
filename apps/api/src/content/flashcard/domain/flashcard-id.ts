import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { FlashcardIdInvalid } from './exceptions/flashcard-id-invalid';

export class FlashcardId extends UuidValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValidUuid(value);
  }

  private ensureIsValidUuid(value: string): void {
    if (!UuidValueObject.isValid(value)) throw new FlashcardIdInvalid();
  }
}
