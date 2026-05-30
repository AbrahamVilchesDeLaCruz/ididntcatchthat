import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AudioGenerationFailed extends DomainException {
  constructor(status: number, statusText: string) {
    super(`ElevenLabs error: ${status} ${statusText}`);
  }
}
