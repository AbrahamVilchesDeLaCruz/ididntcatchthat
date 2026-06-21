import { UserId } from '@/shared/domain/user-id';
import { RankingType } from '@/ranking/domain/ranking-type';
import { RankingPeriod } from '@/ranking/domain/ranking-period';
import { type RankingKey } from '@/ranking/domain/ranking-key';

export type RankingIdPrimitives = {
  userId: string;
  type: string;
  period: string;
  periodBucket: string;
  module: string;
};

export class RankingId {
  constructor(
    readonly userId: UserId,
    readonly type: RankingType,
    readonly period: RankingPeriod,
    readonly periodBucket: string,
    readonly module: string,
  ) {}

  static fromKey(key: RankingKey, userId: string): RankingId {
    return new RankingId(
      new UserId(userId),
      key.type,
      key.period,
      key.periodBucket,
      key.module,
    );
  }

  static fromPrimitives(p: RankingIdPrimitives): RankingId {
    return new RankingId(
      new UserId(p.userId),
      RankingType.create(p.type),
      RankingPeriod.create(p.period),
      p.periodBucket,
      p.module,
    );
  }

  toPrimitives(): RankingIdPrimitives {
    return {
      userId: this.userId.value,
      type: this.type.value,
      period: this.period.value,
      periodBucket: this.periodBucket,
      module: this.module,
    };
  }
}
