import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FlashcardIdInvalid extends DomainException {
  constructor() {
    super(`Invalid flashcard identifier`);
  }
}
