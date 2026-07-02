import { RankingScore } from '@/ranking/projection/domain/ranking-score';
import { RankingIdMother } from '@test/ranking/projection/domain/ranking-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { MotherCreator } from '@test/shared/domain/mother-creator';

export class RankingScoreMother {
  static random(
    overrides?: Partial<{
      userId: string;
      type: string;
      period: string;
      module: string;
      nickname: string;
      score: number;
    }>,
  ): RankingScore {
    const id = RankingIdMother.random(overrides);

    return RankingScore.create(
      id,
      overrides?.nickname ?? NicknameMother.random().value,
      overrides?.score ??
        MotherCreator.random().number.int({ min: 0, max: 100 }),
    );
  }
}
