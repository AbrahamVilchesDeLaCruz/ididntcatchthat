import { StringValueObject } from '@/shared/domain/string-value-object';
import { RankingPeriodInvalid } from '@/ranking/shared/domain/exceptions/ranking-period-invalid';

const RANKING_PERIODS = ['weekly', 'monthly', 'all_time'] as const;

export type RankingPeriodValue = (typeof RANKING_PERIODS)[number];

export class RankingPeriod extends StringValueObject {
  public constructor(value: RankingPeriodValue) {
    super(value);
  }

  static create(value: string): RankingPeriod {
    if (!RANKING_PERIODS.includes(value as RankingPeriodValue)) {
      throw new RankingPeriodInvalid(value);
    }
    return new RankingPeriod(value as RankingPeriodValue);
  }

  sqlInterval(): string | null {
    if (this.value === 'weekly') return '7 days';
    if (this.value === 'monthly') return '30 days';
    return null;
  }
}
