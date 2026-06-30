import { mock } from 'jest-mock-extended';
import { AchievementGameCompletedEvaluator } from '@/achievement/application/unlock/achievement-game-completed-evaluator';
import { type AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { type TotalAttemptsQuery } from '@/achievement/domain/total-attempts.query';
import { type CompletedGamesCountQuery } from '@/achievement/domain/completed-games-count.query';
import { type ModuleCoverageQuery } from '@/achievement/domain/module-coverage.query';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/application/unlock AchievementGameCompletedEvaluator', () => {
  const unlocker = mock<AchievementUnlocker>();
  const totalAttemptsQuery = mock<TotalAttemptsQuery>();
  const completedGamesCountQuery = mock<CompletedGamesCountQuery>();
  const moduleCoverageQuery = mock<ModuleCoverageQuery>();
  let evaluator: AchievementGameCompletedEvaluator;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(true);
    totalAttemptsQuery.getTotalAttempts.mockReset();
    totalAttemptsQuery.getTotalAttempts.mockResolvedValue(0);
    completedGamesCountQuery.countCompletedGames.mockReset();
    completedGamesCountQuery.countCompletedGames.mockResolvedValue(0);
    completedGamesCountQuery.countCompletedStudySessions.mockReset();
    completedGamesCountQuery.countCompletedStudySessions.mockResolvedValue(0);
    moduleCoverageQuery.hasTouchedAllModules.mockReset();
    moduleCoverageQuery.hasTouchedAllModules.mockResolvedValue(false);
    evaluator = new AchievementGameCompletedEvaluator(
      unlocker,
      totalAttemptsQuery,
      completedGamesCountQuery,
      moduleCoverageQuery,
    );
  });

  it('should skip guest games', async () => {
    const event = GameCompletedEventMother.guest();

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });

  it('should unlock study achievements for study mode', async () => {
    const userId = UserIdMother.random().value;
    completedGamesCountQuery.countCompletedStudySessions.mockResolvedValue(10);
    const event = GameCompletedEventMother.random({
      userId,
      mode: 'study',
    });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'study_first');
    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'study_sessions_10');
    expect(unlocker.unlock).not.toHaveBeenCalledWith(userId, 'first_game');
  });

  it('should unlock first_game for authenticated users', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'first_game');
  });

  it('should unlock weak_warrior for weakest-source games', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      source: GameSourceValue.Weakest,
      mode: 'game',
    });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'weak_warrior');
  });

  it('should unlock perfect_session_10 for flawless 10+ card games', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      cardCount: '10',
      correctCount: 10,
      totalCount: 10,
    });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'perfect_session_10');
  });

  it('should unlock cards_100 when total played attempts reach threshold', async () => {
    const userId = UserIdMother.random().value;
    totalAttemptsQuery.getTotalAttempts.mockResolvedValue(100);
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'cards_100');
  });

  it('should unlock games_10 when ten games are completed', async () => {
    const userId = UserIdMother.random().value;
    completedGamesCountQuery.countCompletedGames.mockResolvedValue(10);
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'games_10');
  });

  it('should unlock module_all_touched when all modules have activity', async () => {
    const userId = UserIdMother.random().value;
    moduleCoverageQuery.hasTouchedAllModules.mockResolvedValue(true);
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'module_all_touched');
  });
});
