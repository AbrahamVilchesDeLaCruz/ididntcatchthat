import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class IpaNotationEmpty extends DomainException {
  constructor() {
    super('IpaNotation cannot be empty');
  }
}
