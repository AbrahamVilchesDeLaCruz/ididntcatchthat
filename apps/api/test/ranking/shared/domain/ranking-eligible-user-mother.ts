import { type RankingEligibleUser } from '@/ranking/shared/domain/ranking-profile.query';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { MotherCreator } from '@test/shared/domain/mother-creator';

export class RankingEligibleUserMother {
  static random(overrides?: Partial<RankingEligibleUser>): RankingEligibleUser {
    return {
      nickname: overrides?.nickname ?? NicknameMother.random().value,
      currentStreak:
        overrides?.currentStreak ??
        MotherCreator.random().number.int({ min: 0, max: 30 }),
    };
  }
}
