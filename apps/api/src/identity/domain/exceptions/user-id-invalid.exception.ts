import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class UserIdInvalidException extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid UserId`);
  }
}
