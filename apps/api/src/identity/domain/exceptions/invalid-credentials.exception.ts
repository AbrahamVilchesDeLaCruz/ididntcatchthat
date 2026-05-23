import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Email or password is incorrect');
  }
}
