import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FlashcardAccessDenied extends DomainException {
  constructor() {
    super(`Access denied`);
  }
}
