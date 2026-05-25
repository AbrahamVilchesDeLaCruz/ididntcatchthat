import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidExampleCount extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
