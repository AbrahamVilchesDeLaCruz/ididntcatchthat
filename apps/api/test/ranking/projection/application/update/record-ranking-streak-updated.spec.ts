import { mock } from 'jest-mock-extended';
import { RecordRankingStreakUpdated } from '@/ranking/projection/application/update/record-ranking-streak-updated';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { type RankingProfileQuery } from '@/ranking/shared/domain/ranking-profile.query';
import { type Logger } from '@/shared/domain/logger';
import { RankingEligibleUserMother } from '@test/ranking/shared/domain/ranking-eligible-user-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('ranking/projection/application/update RecordRankingStreakUpdated', () => {
  const repository = mock<RankingScoreRepository>();
  const profileQuery = mock<RankingProfileQuery>();
  const logger = mock<Logger>();
  let recorder: RecordRankingStreakUpdated;

  beforeEach(() => {
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    recorder = new RecordRankingStreakUpdated(
      new RankingScoreWriter(repository),
      profileQuery,
      logger,
    );
  });

  it('should skip when user is not eligible', async () => {
    profileQuery.findEligibleUser.mockResolvedValue(null);

    await recorder.execute({
      userId: UserIdMother.random().value,
      newStreak: 7,
    });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should apply best_streak when user is eligible', async () => {
    const userId = UserIdMother.random().value;
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );

    await recorder.execute({ userId, newStreak: 7 });

    expect(repository.save).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking score updated for streak',
      { userId, newStreak: 7 },
    );
  });
});
