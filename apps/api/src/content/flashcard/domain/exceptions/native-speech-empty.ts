import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class NativeSpeechEmpty extends DomainException {
  constructor() {
    super('Invalid request');
  }
}
