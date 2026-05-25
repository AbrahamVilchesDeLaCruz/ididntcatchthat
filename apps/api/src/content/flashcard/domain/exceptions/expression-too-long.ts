import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExpressionTooLong extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
