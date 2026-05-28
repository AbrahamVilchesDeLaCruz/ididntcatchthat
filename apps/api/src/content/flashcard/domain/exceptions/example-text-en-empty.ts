import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExampleTextEnEmpty extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
