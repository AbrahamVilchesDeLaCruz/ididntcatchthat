import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type UpdateModuleProgress } from '@/progress/application/update/update-module-progress';
import { UpdateModuleProgressOnGameCompleted } from '@/progress/application/update/update-module-progress-on-game-completed';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/application/update UpdateModuleProgressOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const useCase = mock<UpdateModuleProgress>();
  let subscriber: UpdateModuleProgressOnGameCompleted;

  const makeEvent = (overrides?: {
    userId?: string | null;
    module?: string | null;
  }): GameCompletedEvent => {
    return new GameCompletedEvent('game-id', {
      gameId: 'game-id',
      userId:
        overrides?.userId !== undefined
          ? overrides.userId
          : ProgressUserIdMother.random().value,
      mode: 'game',
      module:
        overrides?.module !== undefined ? overrides.module : 'native_sounds',
      cardCount: '10',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });
  };

  beforeEach(() => {
    useCase.execute.mockReset();
    useCase.execute.mockResolvedValue(undefined);
    subscriber = new UpdateModuleProgressOnGameCompleted(consumer, useCase);
  });

  it('should skip when module is null (random game)', async () => {
    await subscriber.on(makeEvent({ module: null }));

    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('should delegate to use case with userId and module', async () => {
    const userId = ProgressUserIdMother.random().value;

    await subscriber.on(makeEvent({ userId, module: 'native_sounds' }));

    expect(useCase.execute).toHaveBeenCalledWith({
      userId,
      module: 'native_sounds',
    });
  });

  it('should subscribe to GameCompletedEvent', () => {
    expect(subscriber.eventName).toBe(
      'ididntcatchthat.gaming.games.game.completed',
    );
  });
});
