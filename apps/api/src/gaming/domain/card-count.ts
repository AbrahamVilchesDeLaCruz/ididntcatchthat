import { StringValueObject } from '@/shared/domain/string-value-object';
import { CardCountInvalid } from './exceptions/card-count-invalid';

const CARD_COUNTS = ['10', '20', '50'] as const;
export type CardCountValue = (typeof CARD_COUNTS)[number];

export class CardCount extends StringValueObject {
  private constructor(value: CardCountValue) {
    super(value);
  }

  static create(value: string): CardCount {
    if (!CARD_COUNTS.includes(value as CardCountValue)) {
      throw new CardCountInvalid(value);
    }
    return new CardCount(value as CardCountValue);
  }

  toNumber(): number {
    return parseInt(this.value, 10);
  }
}
