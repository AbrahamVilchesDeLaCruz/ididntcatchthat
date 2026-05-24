import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class UserSessionCompromisedException extends DomainException {
  constructor() {
    super('Refresh token reuse detected — session has been revoked');
  }
}
