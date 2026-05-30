import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type ModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { ModuleProgressUpdaterOnGameCompleted } from '@/progress/application/update/update-module-progress-on-game-completed';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/application/update ModuleProgressUpdaterOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<ModuleProgressUpdater>();
  let subscriber: ModuleProgressUpdaterOnGameCompleted;

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
    updater.execute.mockReset();
    updater.execute.mockResolvedValue(undefined);
    subscriber = new ModuleProgressUpdaterOnGameCompleted(consumer, updater);
  });

  it('should skip when module is null (random game)', async () => {
    await subscriber.on(makeEvent({ module: null }));

    expect(updater.execute).not.toHaveBeenCalled();
  });

  it('should skip when userId is null (guest game)', async () => {
    await subscriber.on(makeEvent({ userId: null, module: 'native_sounds' }));

    expect(updater.execute).not.toHaveBeenCalled();
  });

  it('should delegate to use case with userId and module', async () => {
    const userId = ProgressUserIdMother.random().value;

    await subscriber.on(makeEvent({ userId, module: 'native_sounds' }));

    expect(updater.execute).toHaveBeenCalledWith({
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
