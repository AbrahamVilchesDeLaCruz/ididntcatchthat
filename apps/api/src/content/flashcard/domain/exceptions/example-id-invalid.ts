import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExampleIdInvalid extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
