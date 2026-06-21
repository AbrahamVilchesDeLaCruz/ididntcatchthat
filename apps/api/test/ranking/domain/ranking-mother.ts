import { Ranking } from '@/ranking/domain/ranking';
import { RankingIdMother } from '@test/ranking/domain/ranking-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { MotherCreator } from '@test/shared/domain/mother-creator';

export class RankingMother {
  static random(
    overrides?: Partial<{
      userId: string;
      type: string;
      period: string;
      module: string;
      nickname: string;
      score: number;
    }>,
  ): Ranking {
    const id = RankingIdMother.random(overrides);

    return Ranking.create(
      id,
      overrides?.nickname ?? NicknameMother.random().value,
      overrides?.score ??
        MotherCreator.random().number.int({ min: 0, max: 100 }),
    );
  }
}
