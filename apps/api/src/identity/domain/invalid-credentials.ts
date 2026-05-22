import { DomainException } from '@/shared/domain/domain-exception';

export class InvalidCredentials extends DomainException {
  constructor() {
    super('Email or password is incorrect');
  }
}
