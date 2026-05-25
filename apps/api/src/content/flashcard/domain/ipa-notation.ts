import { StringValueObject } from '@/shared/domain/string-value-object';
import { IpaNotationEmpty } from './exceptions/ipa-notation-empty';

export class IpaNotation extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsNotEmpty(value);
  }

  private ensureIsNotEmpty(value: string): void {
    if (!value?.trim()) throw new IpaNotationEmpty();
  }
}
