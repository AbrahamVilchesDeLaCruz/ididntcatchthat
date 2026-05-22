import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class UserRoleInvalidException extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid UserRole`);
  }
}
