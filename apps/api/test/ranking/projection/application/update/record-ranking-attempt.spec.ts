import { mock } from 'jest-mock-extended';
import { RecordRankingAttempt } from '@/ranking/projection/application/update/record-ranking-attempt';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { type RankingProfileQuery } from '@/ranking/shared/domain/ranking-profile.query';
import { type RankingUserStatsQuery } from '@/ranking/projection/domain/ranking-user-stats.query';
import { type Logger } from '@/shared/domain/logger';
import { RankingEligibleUserMother } from '@test/ranking/shared/domain/ranking-eligible-user-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';

describe('ranking/projection/application/update RecordRankingAttempt', () => {
  const repository = mock<RankingScoreRepository>();
  const profileQuery = mock<RankingProfileQuery>();
  const statsQuery = mock<RankingUserStatsQuery>();
  const logger = mock<Logger>();
  let recorder: RecordRankingAttempt;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    profileQuery.findEligibleUser.mockReset();
    statsQuery.sumCorrectCount.mockReset();
    statsQuery.avgAccuracy.mockReset();
    logger.info.mockReset();
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    statsQuery.sumCorrectCount.mockResolvedValue(5);
    statsQuery.avgAccuracy.mockResolvedValue(85);
    recorder = new RecordRankingAttempt(
      new RankingScoreWriter(repository),
      profileQuery,
      statsQuery,
      logger,
    );
  });

  it('should apply top_scorer from sumCorrectCount for parity with backfill', async () => {
    const userId = UserIdMother.random().value;
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );

    await recorder.execute({
      userId,
      mode: GameModeMother.game().value,
      correct: true,
      answeredAt: '2026-06-19T12:00:00.000Z',
    });

    expect(statsQuery.sumCorrectCount).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
  });

  it('should skip when mode is not game', async () => {
    await recorder.execute({
      userId: UserIdMother.random().value,
      mode: GameModeMother.study().value,
      correct: true,
      answeredAt: '2026-06-19T12:00:00.000Z',
    });

    expect(profileQuery.findEligibleUser).not.toHaveBeenCalled();
  });

  it('should skip when user is not eligible', async () => {
    profileQuery.findEligibleUser.mockResolvedValue(null);

    await recorder.execute({
      userId: UserIdMother.random().value,
      mode: GameModeMother.game().value,
      correct: true,
      answeredAt: '2026-06-19T12:00:00.000Z',
    });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should skip top_scorer when attempt was incorrect', async () => {
    const userId = UserIdMother.random().value;
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    statsQuery.avgAccuracy.mockResolvedValue(null);

    await recorder.execute({
      userId,
      mode: GameModeMother.game().value,
      correct: false,
      answeredAt: '2026-06-19T12:00:00.000Z',
    });

    expect(statsQuery.sumCorrectCount).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking score updated for attempt',
      { userId },
    );
  });
});
