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

  static pending(): AudioStatus {
    return new AudioStatus(AudioStatusValue.Pending);
  }

  static generating(): AudioStatus {
    return new AudioStatus(AudioStatusValue.Generating);
  }

  static ready(): AudioStatus {
    return new AudioStatus(AudioStatusValue.Ready);
  }

  static failed(): AudioStatus {
    return new AudioStatus(AudioStatusValue.Failed);
  }

  isPending(): boolean {
    return this.value === (AudioStatusValue.Pending as string);
  }

  isReady(): boolean {
    return this.value === (AudioStatusValue.Ready as string);
  }
}
