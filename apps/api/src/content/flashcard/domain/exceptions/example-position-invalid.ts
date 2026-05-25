import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExamplePositionInvalid extends DomainException {
  constructor() {
    super(`Invalid example position`);
  }
}
