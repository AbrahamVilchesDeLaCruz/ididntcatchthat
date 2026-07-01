import { type RequestRankingSearcher } from '@/ranking/search/application/search/request-ranking-searcher';
import { RankingPeriodMother } from '@test/ranking/shared/domain/ranking-period-mother';
import { RankingTypeMother } from '@test/ranking/shared/domain/ranking-type-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export type { RequestRankingSearcher } from '@/ranking/search/application/search/request-ranking-searcher';

export class RequestRankingSearcherMother {
  static random(
    overrides?: Partial<RequestRankingSearcher>,
  ): RequestRankingSearcher {
    return {
      userId: UserIdMother.random().value,
      type: RankingTypeMother.mostActive().value,
      period: RankingPeriodMother.weekly().value,
      limit: 10,
      ...overrides,
    };
  }
}
