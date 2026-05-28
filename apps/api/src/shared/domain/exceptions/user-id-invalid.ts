import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class UserIdInvalid extends DomainException {
  constructor(value: string) {
    super(`UserId value <${value}> is not a valid UUID`);
  }
}
