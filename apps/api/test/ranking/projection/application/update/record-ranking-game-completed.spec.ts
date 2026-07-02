import { mock } from 'jest-mock-extended';
import { RecordRankingGameCompleted } from '@/ranking/projection/application/update/record-ranking-game-completed';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { type RankingProfileQuery } from '@/ranking/shared/domain/ranking-profile.query';
import { type RankingUserStatsQuery } from '@/ranking/projection/domain/ranking-user-stats.query';
import { type Logger } from '@/shared/domain/logger';
import { RankingEligibleUserMother } from '@test/ranking/shared/domain/ranking-eligible-user-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('ranking/projection/application/update RecordRankingGameCompleted', () => {
  const repository = mock<RankingScoreRepository>();
  const profileQuery = mock<RankingProfileQuery>();
  const statsQuery = mock<RankingUserStatsQuery>();
  const logger = mock<Logger>();
  let recorder: RecordRankingGameCompleted;

  beforeEach(() => {
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    statsQuery.countCompletedGames.mockResolvedValue(1);
    recorder = new RecordRankingGameCompleted(
      new RankingScoreWriter(repository),
      profileQuery,
      statsQuery,
      logger,
    );
  });

  it('should skip when user is not eligible', async () => {
    profileQuery.findEligibleUser.mockResolvedValue(null);

    await recorder.execute({
      userId: UserIdMother.random().value,
      mode: GameModeMother.game().value,
      finishedAt: DateMother.recent().toISOString(),
    });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should skip when mode is study', async () => {
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );

    await recorder.execute({
      userId: UserIdMother.random().value,
      mode: GameModeMother.study().value,
      finishedAt: DateMother.recent().toISOString(),
    });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should update most_active when user is eligible', async () => {
    const userId = UserIdMother.random().value;
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );

    await recorder.execute({
      userId,
      mode: GameModeMother.game().value,
      finishedAt: '2026-06-19T12:00:00.000Z',
    });

    expect(repository.save).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking score updated for game completed',
      { userId },
    );
  });
});
