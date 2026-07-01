import { mock } from 'jest-mock-extended';
import { SyncRankingProfile } from '@/ranking/projection/application/update/sync-ranking-profile';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { type RankingProfileQuery } from '@/ranking/shared/domain/ranking-profile.query';
import { type RankingUserStatsQuery } from '@/ranking/projection/domain/ranking-user-stats.query';
import { type Logger } from '@/shared/domain/logger';
import { RankingEligibleUserMother } from '@test/ranking/shared/domain/ranking-eligible-user-mother';
import { RankingScoreMother } from '@test/ranking/projection/domain/ranking-score-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { ModuleMasteryLevelMother } from '@test/progress/domain/module-mastery-level-mother';

describe('ranking/projection/application/update SyncRankingProfile', () => {
  const repository = mock<RankingScoreRepository>();
  const profileQuery = mock<RankingProfileQuery>();
  const statsQuery = mock<RankingUserStatsQuery>();
  const logger = mock<Logger>();
  let syncer: SyncRankingProfile;

  beforeEach(() => {
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    repository.match.mockResolvedValue([]);
    repository.remove.mockResolvedValue(undefined);
    statsQuery.countCompletedGames.mockResolvedValue(3);
    statsQuery.avgAccuracy.mockResolvedValue(0.85);
    statsQuery.sumCorrectCount.mockResolvedValue(12);
    statsQuery.moduleMasteryLevels.mockResolvedValue([
      {
        module: ModuleNameMother.nativeSounds().value,
        level: ModuleMasteryLevelMother.intermediate(),
      },
    ]);
    syncer = new SyncRankingProfile(
      new RankingScoreWriter(repository),
      profileQuery,
      statsQuery,
      logger,
    );
  });

  it('should remove all scores when user opts out', async () => {
    const userId = UserIdMother.random().value;
    const existing = RankingScoreMother.random({ userId });
    repository.match.mockResolvedValue([existing]);

    await syncer.execute({
      userId,
      showInRanking: false,
      nickname: NicknameMother.random().value,
    });

    expect(repository.remove).toHaveBeenCalledWith(existing.id);
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking scores removed after opt-out',
      { userId },
    );
  });

  it('should rename and backfill when user opts in', async () => {
    const userId = UserIdMother.random().value;
    const nickname = NicknameMother.random().value;
    const existing = RankingScoreMother.random({ userId });
    repository.match.mockResolvedValue([existing]);
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random({ currentStreak: 5 }),
    );

    await syncer.execute({
      userId,
      showInRanking: true,
      nickname,
    });

    expect(repository.save).toHaveBeenCalled();
    expect(statsQuery.countCompletedGames).toHaveBeenCalled();
    expect(statsQuery.moduleMasteryLevels).toHaveBeenCalledWith(userId);
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking scores synced after profile update',
      { userId },
    );
  });

  it('should skip most_accurate backfill when accuracy is null', async () => {
    const userId = UserIdMother.random().value;
    statsQuery.avgAccuracy.mockResolvedValue(null);
    profileQuery.findEligibleUser.mockResolvedValue(null);

    await syncer.execute({
      userId,
      showInRanking: true,
      nickname: NicknameMother.random().value,
    });

    expect(statsQuery.sumCorrectCount).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking scores synced after profile update',
      { userId },
    );
  });
});
