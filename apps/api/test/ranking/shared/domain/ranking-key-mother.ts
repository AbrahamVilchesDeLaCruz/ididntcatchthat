import { RankingKey } from '@/ranking/shared/domain/ranking-key';
import { RankingTypeMother } from '@test/ranking/shared/domain/ranking-type-mother';
import { RankingPeriodMother } from '@test/ranking/shared/domain/ranking-period-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';

export class RankingKeyMother {
  static random(
    overrides?: Partial<{
      type: string;
      period: string;
      module: string;
    }>,
  ): RankingKey {
    const type = overrides?.type ?? RankingTypeMother.random().value;
    const period = overrides?.period ?? RankingPeriodMother.random().value;
    const module =
      overrides?.module ??
      (type === 'module_master' ? ModuleNameMother.random().value : undefined);

    return RankingKey.create(type, period, module);
  }

  static mostActiveAllTime(): RankingKey {
    return RankingKey.create(
      RankingTypeMother.mostActive().value,
      RankingPeriodMother.allTime().value,
    );
  }
}
