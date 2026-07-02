import {
  RankingPeriod,
  type RankingPeriodValue,
} from '@/ranking/shared/domain/ranking-period';
import { MotherCreator } from '@test/shared/domain/mother-creator';

const RANKING_PERIOD_VALUES: RankingPeriodValue[] = [
  'weekly',
  'monthly',
  'all_time',
];

export class RankingPeriodMother {
  static random(): RankingPeriod {
    const value = MotherCreator.random().helpers.arrayElement(
      RANKING_PERIOD_VALUES,
    );
    return RankingPeriod.create(value);
  }

  static weekly(): RankingPeriod {
    return RankingPeriod.create('weekly');
  }

  static monthly(): RankingPeriod {
    return RankingPeriod.create('monthly');
  }

  static allTime(): RankingPeriod {
    return RankingPeriod.create('all_time');
  }

  static invalid(): string {
    return 'invalid_period';
  }
}
