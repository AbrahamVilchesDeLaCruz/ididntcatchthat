import { StringValueObject } from '@/shared/domain/string-value-object';
import { AudioStatusInvalid } from './exceptions/audio-status-invalid';

export enum AudioStatusValue {
  Pending = 'pending',
  Generating = 'generating',
  Ready = 'ready',
  Failed = 'failed',
}

export class AudioStatus extends StringValueObject {
  private static readonly VALID_VALUES = new Set<string>(
    Object.values(AudioStatusValue),
  );

  constructor(value: string) {
    super(value);
    this.ensureAudioStatusIsValid(value);
  }

  private ensureAudioStatusIsValid(value: string): void {
    if (!AudioStatus.VALID_VALUES.has(value)) throw new AudioStatusInvalid();
  }

  isPending(): boolean {
    return this.value === (AudioStatusValue.Pending as string);
  }

  isReady(): boolean {
    return this.value === (AudioStatusValue.Ready as string);
  }

  isFailed(): boolean {
    return this.value === (AudioStatusValue.Failed as string);
  }

  isGenerating(): boolean {
    return this.value === (AudioStatusValue.Generating as string);
  }

  canRegenerateAudio(): boolean {
    return this.isPending() || this.isFailed() || this.isGenerating();
  }
}
