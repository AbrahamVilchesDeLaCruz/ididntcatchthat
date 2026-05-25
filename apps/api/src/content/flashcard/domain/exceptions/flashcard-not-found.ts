import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FlashcardNotFound extends DomainException {
  constructor() {
    super(`Flashcard not found`);
  }
}
