import { DomainException } from '@/shared/domain/domain-exception';

export class UserSessionCompromised extends DomainException {
  constructor() {
    super('Refresh token reuse detected — session has been revoked');
  }
}
