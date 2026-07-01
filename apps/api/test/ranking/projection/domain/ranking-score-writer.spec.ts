import { mock } from 'jest-mock-extended';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { RankingScoreMother } from '@test/ranking/projection/domain/ranking-score-mother';
import { RankingTypeMother } from '@test/ranking/shared/domain/ranking-type-mother';
import { RankingPeriodMother } from '@test/ranking/shared/domain/ranking-period-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';

describe('ranking/projection/domain RankingScoreWriter', () => {
  const repository = mock<RankingScoreRepository>();
  let writer: RankingScoreWriter;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    repository.match.mockReset();
    repository.remove.mockReset();
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    writer = new RankingScoreWriter(repository);
  });

  it('should increment score on existing ranking row', async () => {
    const userId = UserIdMother.random().value;
    const existing = RankingScoreMother.random({
      userId,
      type: RankingTypeMother.mostActive().value,
      period: RankingPeriodMother.allTime().value,
      score: 2,
    });
    repository.search.mockResolvedValue(existing);

    await writer.incrementScore(
      writer.key('most_active', 'all_time'),
      userId,
      NicknameMother.random().value,
      1,
    );

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ score: 3 }),
    );
  });
});
