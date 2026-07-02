import { Inject, Injectable } from '@nestjs/common';
import {
  type RankingProfileQuery,
  type RankingEligibleUser,
  type RankingUserPreferences,
} from '@/ranking/shared/domain/ranking-profile.query';
import {
  type RankingEligibilityQuery,
  RANKING_ELIGIBILITY_QUERY,
} from '@/identity/user/domain/ranking-eligibility.query';
import { UserId } from '@/shared/domain/user-id';

@Injectable()
export class IdentityRankingProfileAdapter implements RankingProfileQuery {
  constructor(
    @Inject(RANKING_ELIGIBILITY_QUERY)
    private readonly eligibilityQuery: RankingEligibilityQuery,
  ) {}

  async findEligibleUser(userId: string): Promise<RankingEligibleUser | null> {
    return this.eligibilityQuery.findEligibleUser(new UserId(userId));
  }

  async findUserRankingPreferences(
    userId: string,
  ): Promise<RankingUserPreferences | null> {
    return this.eligibilityQuery.findPreferences(new UserId(userId));
  }
}
