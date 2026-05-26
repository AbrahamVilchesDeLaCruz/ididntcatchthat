import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GuestLimitExceeded extends DomainException {
  constructor() {
    super('Guest daily game limit exceeded (max 3 games of 10 cards per day)');
  }
}
