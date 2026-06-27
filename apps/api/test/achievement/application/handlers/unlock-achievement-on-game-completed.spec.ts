import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockAchievementOnGameCompleted } from '@/achievement/application/handlers/unlock-achievement-on-game-completed';
import { type AchievementGameCompletedEvaluator } from '@/achievement/application/unlock/achievement-game-completed-evaluator';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';

describe('achievement/application/handlers UnlockAchievementOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const evaluator = mock<AchievementGameCompletedEvaluator>();
  let handler: UnlockAchievementOnGameCompleted;

  beforeEach(() => {
    evaluator.evaluate.mockReset();
    evaluator.evaluate.mockResolvedValue(undefined);
    handler = new UnlockAchievementOnGameCompleted(consumer, evaluator);
  });

  it('should delegate to AchievementGameCompletedEvaluator', async () => {
    const event = GameCompletedEventMother.random();

    await handler.on(event);

    expect(evaluator.evaluate).toHaveBeenCalledWith(event.attributes);
  });
});
