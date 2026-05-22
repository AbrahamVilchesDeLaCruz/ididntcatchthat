import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ExpiredRefreshTokenException extends DomainException {
  constructor() {
    super('Refresh token has expired');
  }
}
