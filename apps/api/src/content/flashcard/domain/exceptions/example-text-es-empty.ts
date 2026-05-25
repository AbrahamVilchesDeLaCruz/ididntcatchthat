import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExampleTextEsEmpty extends DomainException {
  constructor() {
    super('Example textEs cannot be empty');
  }
}
