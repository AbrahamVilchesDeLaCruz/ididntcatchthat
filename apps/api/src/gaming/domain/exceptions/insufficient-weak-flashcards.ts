import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InsufficientWeakFlashcards extends DomainException {
  constructor() {
    super('Not enough weak flashcards to start a game');
  }
}
