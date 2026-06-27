import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class WeakestSourceRequiresAuth extends DomainException {
  constructor() {
    super('Weakest flashcard games require an authenticated user');
  }
}
