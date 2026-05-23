import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class WeakPasswordException extends DomainException {
  constructor() {
    super(
      'Password must be at least 8 characters and include uppercase, lowercase, number and symbol',
    );
  }
}
