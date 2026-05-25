import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class MeaningEmpty extends DomainException {
  constructor() {
    super('Meaning cannot be empty');
  }
}
