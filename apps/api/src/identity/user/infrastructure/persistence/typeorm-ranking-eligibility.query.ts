import { Inject, Injectable } from '@nestjs/common';
import {
  type RankingEligibilityQuery,
  type RankingEligibleUserSnapshot,
  type RankingPreferencesSnapshot,
} from '@/identity/user/domain/ranking-eligibility.query';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import { type UserId } from '@/shared/domain/user-id';

@Injectable()
export class TypeOrmRankingEligibilityQuery implements RankingEligibilityQuery {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async findEligibleUser(
    userId: UserId,
  ): Promise<RankingEligibleUserSnapshot | null> {
    const user = await this.userRepository.search(userId);
    if (!user?.showInRanking) return null;

    return {
      nickname: user.nickname.value,
      currentStreak: user.currentStreak,
    };
  }

  async findPreferences(
    userId: UserId,
  ): Promise<RankingPreferencesSnapshot | null> {
    const user = await this.userRepository.search(userId);
    if (!user) return null;

    return {
      nickname: user.nickname.value,
      showInRanking: user.showInRanking,
    };
  }
}
