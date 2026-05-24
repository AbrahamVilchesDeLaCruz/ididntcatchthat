import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class PasswordHashEmptyException extends DomainException {
  constructor() {
    super('PasswordHash cannot be empty');
  }
}
