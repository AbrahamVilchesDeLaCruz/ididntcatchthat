import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FingerprintEmptyException extends DomainException {
  constructor() {
    super('Fingerprint cannot be empty');
  }
}
