import { StringValueObject } from '@/shared/domain/string-value-object';
import { MeaningEmpty } from './exceptions/meaning-empty';
import { MeaningTooLong } from './exceptions/meaning-too-long';

export class Meaning extends StringValueObject {
  private static readonly MAX_LENGTH = 500;

  constructor(value: string) {
    super(value);
    this.ensureIsNotEmpty(value);
    this.ensureIsNotTooLong(value);
  }

  private ensureIsNotEmpty(value: string): void {
    if (!value?.trim()) throw new MeaningEmpty();
  }

  private ensureIsNotTooLong(value: string): void {
    if (value.length > Meaning.MAX_LENGTH) throw new MeaningTooLong();
  }
}
