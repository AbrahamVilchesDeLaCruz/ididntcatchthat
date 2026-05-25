import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class MeaningTooLong extends DomainException {
  constructor() {
    super(`Meaning is too long`);
  }
}
