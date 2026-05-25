import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidSubcategory extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
