import { type RankingKey } from '@/ranking/domain/ranking-key';
import { RankingId } from '@/ranking/domain/ranking-id';
import { RankingKeyMother } from '@test/ranking/domain/ranking-key-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export class RankingIdMother {
  static random(
    overrides?: Partial<{
      userId: string;
      type: string;
      period: string;
      module: string;
    }>,
  ): RankingId {
    const userId = overrides?.userId ?? UserIdMother.random().value;
    const key = RankingKeyMother.random(overrides);
    return RankingId.fromKey(key, userId);
  }

  static fromKey(key: RankingKey, userId?: string): RankingId {
    return RankingId.fromKey(key, userId ?? UserIdMother.random().value);
  }
}
