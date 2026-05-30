import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidCriteriaField extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
