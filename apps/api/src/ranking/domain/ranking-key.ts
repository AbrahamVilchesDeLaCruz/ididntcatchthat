import { RankingType } from '@/ranking/domain/ranking-type';
import { RankingPeriod } from '@/ranking/domain/ranking-period';
import { RankingPeriodBucket } from '@/ranking/domain/ranking-period-bucket';
import { RankingModuleRequired } from '@/ranking/domain/exceptions/ranking-module-required';

export const GLOBAL_MODULE_SCOPE = 'global';

export class RankingKey {
  constructor(
    readonly type: RankingType,
    readonly period: RankingPeriod,
    readonly periodBucket: string,
    readonly module: string,
  ) {}

  static create(type: string, period: string, module?: string): RankingKey {
    const rankingType = RankingType.create(type);
    const effectivePeriod = RankingKey.effectivePeriod(
      rankingType.value,
      period,
    );
    const rankingPeriod = RankingPeriod.create(effectivePeriod);

    return new RankingKey(
      rankingType,
      rankingPeriod,
      RankingPeriodBucket.bucketFor(effectivePeriod),
      RankingKey.resolveModuleScope(rankingType.value, module),
    );
  }

  static effectivePeriod(type: string, period: string): string {
    if (type === 'best_streak' || type === 'module_master') {
      return 'all_time';
    }
    return period;
  }

  static resolveModuleScope(type: string, module?: string): string {
    if (type === 'module_master') {
      if (!module) {
        throw new RankingModuleRequired();
      }
      return module;
    }
    return GLOBAL_MODULE_SCOPE;
  }
}
