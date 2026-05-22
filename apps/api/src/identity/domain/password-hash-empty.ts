import { DomainException } from '@/shared/domain/domain-exception';

export class PasswordHashEmpty extends DomainException {
  constructor() {
    super('PasswordHash cannot be empty');
  }
}
