import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class BulkEmptyFlashcards extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
