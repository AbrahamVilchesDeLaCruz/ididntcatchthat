import { DomainException } from '@/shared/domain/domain-exception';

export class UserRoleInvalid extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid UserRole`);
  }
}
