import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class CardCountInvalid extends DomainException {
  constructor(value: string) {
    super(`CardCount value <${value}> is invalid`);
  }
}
