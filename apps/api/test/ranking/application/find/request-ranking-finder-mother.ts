import { type RequestRankingFinder } from '@/ranking/application/find/ranking-finder';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { RankingTypeMother } from '@test/ranking/domain/ranking-type-mother';
import { RankingPeriodMother } from '@test/ranking/domain/ranking-period-mother';
import { MotherCreator } from '@test/shared/domain/mother-creator';

export type { RequestRankingFinder } from '@/ranking/application/find/ranking-finder';

export class RequestRankingFinderMother {
  static random(
    overrides?: Partial<RequestRankingFinder>,
  ): RequestRankingFinder {
    return {
      userId: UserIdMother.random().value,
      type: RankingTypeMother.mostActive().value,
      period: RankingPeriodMother.weekly().value,
      limit: MotherCreator.random().number.int({ min: 5, max: 50 }),
      ...overrides,
    };
  }
}
