import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AudioUrlsInvalid extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
