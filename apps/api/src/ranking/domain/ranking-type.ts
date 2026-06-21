import { StringValueObject } from '@/shared/domain/string-value-object';
import { RankingTypeInvalid } from '@/ranking/domain/exceptions/ranking-type-invalid';

const RANKING_TYPES = [
  'most_active',
  'most_accurate',
  'top_scorer',
  'best_streak',
  'module_master',
] as const;

export type RankingTypeValue = (typeof RANKING_TYPES)[number];

export class RankingType extends StringValueObject {
  public constructor(value: RankingTypeValue) {
    super(value);
  }

  static create(value: string): RankingType {
    if (!RANKING_TYPES.includes(value as RankingTypeValue)) {
      throw new RankingTypeInvalid(value);
    }
    return new RankingType(value as RankingTypeValue);
  }
}
