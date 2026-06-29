import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class WeakestSourceRequiresGameMode extends DomainException {
  constructor() {
    super('Weakest flashcards source is only available in game mode');
  }
}
