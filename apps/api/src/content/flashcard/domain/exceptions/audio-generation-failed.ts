import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AudioGenerationFailed extends DomainException {
  readonly status: number;
  readonly detail: string | null;

  constructor(
    status: number,
    statusText: string,
    detail: string | null = null,
  ) {
    super(
      detail !== null
        ? `ElevenLabs error: ${status} ${statusText} — ${detail}`
        : `ElevenLabs error: ${status} ${statusText}`,
    );
    this.status = status;
    this.detail = detail;
  }
}
