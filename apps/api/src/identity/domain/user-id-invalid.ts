import { DomainException } from '@/shared/domain/domain-exception';

export class UserIdInvalid extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid UserId`);
  }
}
