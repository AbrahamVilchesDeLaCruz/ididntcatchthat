import { DomainException } from '@/shared/domain/domain-exception';

export class WeakPassword extends DomainException {
  constructor() {
    super(
      'Password must be at least 8 characters and include uppercase, lowercase, number and symbol',
    );
  }
}
