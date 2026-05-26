import { StringValueObject } from '@/shared/domain/string-value-object';
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

const CARD_COUNTS = ['10', '20', '50'] as const;
type CardCountValue = (typeof CARD_COUNTS)[number];

export class CardCountInvalid extends DomainException {
  constructor(value: string) {
    super(
      `CardCount value <${value}> is invalid. Must be one of: ${CARD_COUNTS.join(', ')}`,
    );
  }
}

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
