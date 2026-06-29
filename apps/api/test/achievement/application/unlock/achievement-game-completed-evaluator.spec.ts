import { mock } from 'jest-mock-extended';
import { AchievementGameCompletedEvaluator } from '@/achievement/application/unlock/achievement-game-completed-evaluator';
import { type AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { type TotalAttemptsQuery } from '@/achievement/domain/total-attempts.query';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/application/unlock AchievementGameCompletedEvaluator', () => {
  const unlocker = mock<AchievementUnlocker>();
  const totalAttemptsQuery = mock<TotalAttemptsQuery>();
  let evaluator: AchievementGameCompletedEvaluator;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(true);
    totalAttemptsQuery.getTotalAttempts.mockReset();
    totalAttemptsQuery.getTotalAttempts.mockResolvedValue(0);
    evaluator = new AchievementGameCompletedEvaluator(
      unlocker,
      totalAttemptsQuery,
    );
  });

  it('should skip guest games', async () => {
    const event = GameCompletedEventMother.guest();

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });

  it('should skip study mode completions', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      mode: 'study',
    });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).not.toHaveBeenCalled();
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

  it('should unlock cards_100 when total attempts reach threshold', async () => {
    const userId = UserIdMother.random().value;
    totalAttemptsQuery.getTotalAttempts.mockResolvedValue(100);
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.evaluate(event.attributes as never);

    expect(unlocker.unlock).toHaveBeenCalledWith(userId, 'cards_100');
  });
});
