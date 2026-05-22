import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super('Refresh token is invalid');
  }
}
