import { DomainException } from '@/shared/domain/domain-exception';

export class ExpiredRefreshToken extends DomainException {
  constructor() {
    super('Refresh token has expired');
  }
}
