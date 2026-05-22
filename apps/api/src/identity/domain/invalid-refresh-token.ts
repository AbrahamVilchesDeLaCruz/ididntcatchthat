import { DomainException } from '@/shared/domain/domain-exception';

export class InvalidRefreshToken extends DomainException {
  constructor() {
    super('Refresh token is invalid');
  }
}
