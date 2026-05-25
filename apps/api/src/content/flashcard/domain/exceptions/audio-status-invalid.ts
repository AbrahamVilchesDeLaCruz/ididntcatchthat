import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AudioStatusInvalid extends DomainException {
  constructor() {
    super(`Invalid audio status`);
  }
}
