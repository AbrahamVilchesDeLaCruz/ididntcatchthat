import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidCriteriaFieldException extends DomainException {
  constructor() {
    super('Invalid criteria field for user session repository');
  }
}
