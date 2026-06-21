import { CardCount, type CardCountValue } from '@/gaming/domain/card-count';
import { MotherCreator } from '@test/shared/domain/mother-creator';

const CARD_COUNT_VALUES: CardCountValue[] = ['10', '20', '50'];

export class CardCountMother {
  static random(): CardCount {
    const value =
      MotherCreator.random().helpers.arrayElement(CARD_COUNT_VALUES);
    return CardCount.create(value);
  }

  static ten(): CardCount {
    return CardCount.create('10');
  }

  static invalid(): string {
    return '15';
  }
}
