import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type ModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { type GameAttemptModulesQuery } from '@/progress/domain/game-attempt-modules.query';
import { ModuleProgressUpdaterOnGameCompleted } from '@/progress/application/update/update-module-progress-on-game-completed';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/application/update ModuleProgressUpdaterOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<ModuleProgressUpdater>();
  const gameAttemptModulesQuery = mock<GameAttemptModulesQuery>();
  let subscriber: ModuleProgressUpdaterOnGameCompleted;

  const makeEvent = (overrides?: {
    userId?: string | null;
    module?: string | null;
    gameId?: string;
  }): GameCompletedEvent => {
    return new GameCompletedEvent(overrides?.gameId ?? 'game-id', {
      gameId: overrides?.gameId ?? 'game-id',
      userId:
        overrides?.userId !== undefined
          ? overrides.userId
          : ProgressUserIdMother.random().value,
      mode: 'game',
      module:
        overrides?.module !== undefined ? overrides.module : 'native_sounds',
      subcategory: null,
      source: GameSourceValue.Catalog,
      cardCount: '10',
      correctCount: 8,
      totalCount: 10,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });
  };

  beforeEach(() => {
    updater.execute.mockReset();
    gameAttemptModulesQuery.findModulesByGameId.mockReset();
    updater.execute.mockResolvedValue(undefined);
    subscriber = new ModuleProgressUpdaterOnGameCompleted(
      consumer,
      updater,
      gameAttemptModulesQuery,
    );
  });

  it('should recalculate each touched module when random game completes', async () => {
    const userId = ProgressUserIdMother.random().value;
    gameAttemptModulesQuery.findModulesByGameId.mockResolvedValue([
      'native_sounds',
      'connected_speech',
    ]);

    await subscriber.on(makeEvent({ userId, module: null, gameId: 'game-id' }));

    expect(gameAttemptModulesQuery.findModulesByGameId).toHaveBeenCalledWith(
      'game-id',
    );
    expect(updater.execute).toHaveBeenCalledTimes(2);
    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      module: 'native_sounds',
    });
    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      module: 'connected_speech',
    });
  });

  it('should skip when userId is null (guest game)', async () => {
    await subscriber.on(makeEvent({ userId: null, module: 'native_sounds' }));

    expect(updater.execute).not.toHaveBeenCalled();
    expect(gameAttemptModulesQuery.findModulesByGameId).not.toHaveBeenCalled();
  });

  it('should delegate to use case with userId and module', async () => {
    const userId = ProgressUserIdMother.random().value;

    await subscriber.on(makeEvent({ userId, module: 'native_sounds' }));

    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      module: 'native_sounds',
    });
    expect(gameAttemptModulesQuery.findModulesByGameId).not.toHaveBeenCalled();
  });

  it('should subscribe to GameCompletedEvent', () => {
    expect(subscriber.eventName).toBe(
      'ididntcatchthat.gaming.games.game.completed',
    );
  });
});
