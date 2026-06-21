import { mock } from 'jest-mock-extended';
import { RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { type RankingRepository } from '@/ranking/domain/ranking.repository';
import { type RankingUserReader } from '@/ranking/domain/ranking-user.reader';
import { type RankingUserStatsQuery } from '@/ranking/domain/ranking-user-stats.query';
import { type Logger } from '@/shared/domain/logger';
import { RankingMother } from '@test/ranking/domain/ranking-mother';
import { RankingEligibleUserMother } from '@test/ranking/domain/ranking-eligible-user-mother';
import { RankingTypeMother } from '@test/ranking/domain/ranking-type-mother';
import { RankingPeriodMother } from '@test/ranking/domain/ranking-period-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('ranking/application/update RankingUpdater', () => {
  const repository = mock<RankingRepository>();
  const userReader = mock<RankingUserReader>();
  const statsQuery = mock<RankingUserStatsQuery>();
  const logger = mock<Logger>();
  let updater: RankingUpdater;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    repository.match.mockReset();
    repository.remove.mockReset();
    userReader.findEligibleUser.mockReset();
    statsQuery.countCompletedGames.mockReset();
    statsQuery.avgAccuracy.mockReset();
    statsQuery.sumCorrectCount.mockReset();
    statsQuery.moduleMasteryLevels.mockReset();
    logger.info.mockReset();

    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    repository.match.mockResolvedValue([]);
    repository.remove.mockResolvedValue(undefined);
    statsQuery.countCompletedGames.mockResolvedValue(0);
    statsQuery.avgAccuracy.mockResolvedValue(null);
    statsQuery.sumCorrectCount.mockResolvedValue(0);
    statsQuery.moduleMasteryLevels.mockResolvedValue([]);

    updater = new RankingUpdater(repository, userReader, statsQuery, logger);
  });

  it('should skip recordGameCompleted when mode is not game', async () => {
    await updater.recordGameCompleted(
      UserIdMother.random().value,
      GameModeMother.study().value,
      DateMother.recent().toISOString(),
    );

    expect(userReader.findEligibleUser).not.toHaveBeenCalled();
  });

  it('should skip recordGameCompleted when user is not eligible', async () => {
    userReader.findEligibleUser.mockResolvedValue(null);

    await updater.recordGameCompleted(
      UserIdMother.random().value,
      GameModeMother.game().value,
      DateMother.recent().toISOString(),
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should update most_active on game completed for eligible user', async () => {
    const userId = UserIdMother.random().value;
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    statsQuery.countCompletedGames.mockResolvedValue(3);

    await updater.recordGameCompleted(
      userId,
      GameModeMother.game().value,
      '2026-06-19T12:00:00.000Z',
    );

    expect(repository.save).toHaveBeenCalled();
    expect(statsQuery.countCompletedGames).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking updated for game completed',
      { userId },
    );
  });

  it('should increment existing ranking on game completed all_time path', async () => {
    const userId = UserIdMother.random().value;
    const existing = RankingMother.random({
      userId,
      type: RankingTypeMother.mostActive().value,
      period: RankingPeriodMother.allTime().value,
      score: 2,
    });
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    repository.search.mockImplementation((id) => {
      if (
        id.type.value === RankingTypeMother.mostActive().value &&
        id.period.value === RankingPeriodMother.allTime().value
      ) {
        return Promise.resolve(existing);
      }
      return Promise.resolve(null);
    });
    statsQuery.countCompletedGames.mockResolvedValue(1);

    await updater.recordGameCompleted(
      userId,
      GameModeMother.game().value,
      '2026-06-19T12:00:00.000Z',
    );

    const allTimeSave = repository.save.mock.calls.find(
      ([ranking]) =>
        ranking.id.type.value === RankingTypeMother.mostActive().value &&
        ranking.id.period.value === RankingPeriodMother.allTime().value,
    );
    expect(allTimeSave?.[0].score).toBe(3);
  });

  it('should skip recordAttempt when mode is not game', async () => {
    await updater.recordAttempt(
      UserIdMother.random().value,
      GameModeMother.study().value,
      true,
      DateMother.recent().toISOString(),
    );

    expect(userReader.findEligibleUser).not.toHaveBeenCalled();
  });

  it('should update top_scorer and most_accurate on correct attempt', async () => {
    const userId = UserIdMother.random().value;
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    statsQuery.avgAccuracy.mockResolvedValue(85);

    await updater.recordAttempt(
      userId,
      GameModeMother.game().value,
      true,
      '2026-06-19T12:00:00.000Z',
    );

    expect(repository.save).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Ranking updated for attempt', {
      userId,
    });
  });

  it('should skip recordAttempt when user is not eligible', async () => {
    userReader.findEligibleUser.mockResolvedValue(null);

    await updater.recordAttempt(
      UserIdMother.random().value,
      GameModeMother.game().value,
      true,
      DateMother.recent().toISOString(),
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should skip recordModuleMastery when user is not eligible', async () => {
    userReader.findEligibleUser.mockResolvedValue(null);

    await updater.recordModuleMastery(
      UserIdMother.random().value,
      ModuleNameMother.random().value,
      2,
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should skip top_scorer increment on incorrect attempt', async () => {
    const userId = UserIdMother.random().value;
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );

    await updater.recordAttempt(
      userId,
      GameModeMother.game().value,
      false,
      '2026-06-19T12:00:00.000Z',
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should apply existing ranking score on recordAttempt when row exists', async () => {
    const userId = UserIdMother.random().value;
    const existing = RankingMother.random({ userId, score: 10 });
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    repository.search.mockResolvedValue(existing);
    statsQuery.avgAccuracy.mockResolvedValue(90);

    await updater.recordAttempt(
      userId,
      GameModeMother.game().value,
      true,
      '2026-06-19T12:00:00.000Z',
    );

    expect(repository.save).toHaveBeenCalled();
  });

  it('should update best_streak for eligible user', async () => {
    const userId = UserIdMother.random().value;
    const eligible = RankingEligibleUserMother.random({ currentStreak: 7 });
    userReader.findEligibleUser.mockResolvedValue(eligible);

    await updater.recordStreakUpdated(userId, eligible.currentStreak);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should skip recordStreakUpdated when user is not eligible', async () => {
    userReader.findEligibleUser.mockResolvedValue(null);

    await updater.recordStreakUpdated(UserIdMother.random().value, 7);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should update module_master for eligible user', async () => {
    const userId = UserIdMother.random().value;
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    const module = ModuleNameMother.random().value;

    await updater.recordModuleMastery(userId, module, 3);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should remove all rankings on syncProfile opt-out', async () => {
    const userId = UserIdMother.random().value;
    const ranking = RankingMother.random({ userId });
    repository.match.mockResolvedValue([ranking]);

    await updater.syncProfile(userId, false, NicknameMother.random().value);

    expect(repository.remove).toHaveBeenCalledWith(ranking.id);
  });

  it('should rename and backfill on syncProfile opt-in', async () => {
    const userId = UserIdMother.random().value;
    const nickname = NicknameMother.random().value;
    const ranking = RankingMother.random({ userId, nickname: 'old' });
    repository.match.mockResolvedValue([ranking]);
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    statsQuery.avgAccuracy.mockResolvedValue(80);
    statsQuery.moduleMasteryLevels.mockResolvedValue([
      { module: ModuleNameMother.random().value, level: 2 },
    ]);

    await updater.syncProfile(userId, true, nickname);

    expect(repository.save).toHaveBeenCalled();
    expect(statsQuery.moduleMasteryLevels).toHaveBeenCalledWith(userId);
  });

  it('should backfill user scores including streak and module mastery', async () => {
    const userId = UserIdMother.random().value;
    userReader.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );
    statsQuery.avgAccuracy.mockResolvedValue(75);
    statsQuery.moduleMasteryLevels.mockResolvedValue([
      { module: ModuleNameMother.random().value, level: 1 },
    ]);

    await updater.backfillUser(userId, NicknameMother.random().value);

    expect(repository.save).toHaveBeenCalled();
    expect(statsQuery.sumCorrectCount).toHaveBeenCalled();
  });
});
