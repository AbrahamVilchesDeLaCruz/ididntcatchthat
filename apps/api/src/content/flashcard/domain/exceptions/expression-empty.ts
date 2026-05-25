import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExpressionEmpty extends DomainException {
  constructor() {
    super('Expression cannot be empty');
  }
}
