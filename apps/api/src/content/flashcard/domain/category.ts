import { StringValueObject } from '@/shared/domain/string-value-object';
import { CategoryInvalid } from './exceptions/category-invalid';

export enum CategoryValue {
  MasteringSounds = 'mastering_sounds',
  ConnectingWordsInSpeech = 'connecting_words_in_speech',
  BeautifyingSentences = 'beautifying_sentences',
  SoundingNative = 'sounding_native',
}

export class Category extends StringValueObject {
  private static readonly VALID_VALUES = new Set<string>(
    Object.values(CategoryValue),
  );

  constructor(value: string) {
    super(value);
    this.ensureCategoryIsValid(value);
  }

  private ensureCategoryIsValid(value: string): void {
    if (!Category.VALID_VALUES.has(value)) throw new CategoryInvalid();
  }
}
