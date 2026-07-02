import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type ModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { type GameAttemptModulesQuery } from '@/progress/domain/game-attempt-modules.query';
import { ModuleProgressUpdaterOnGameCompleted } from '@/progress/application/update/update-module-progress-on-game-completed';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

describe('progress/application/update ModuleProgressUpdaterOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<ModuleProgressUpdater>();
  const gameAttemptModulesQuery = mock<GameAttemptModulesQuery>();
  let subscriber: ModuleProgressUpdaterOnGameCompleted;

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
    const gameId = GameIdMother.random().value;
    const nativeSounds = ModuleNameMother.nativeSounds().value;
    const connectedSpeech = ModuleNameMother.connectedSpeech().value;
    gameAttemptModulesQuery.findModulesByGameId.mockResolvedValue([
      nativeSounds,
      connectedSpeech,
    ]);

    await subscriber.on(
      GameCompletedEventMother.random({
        userId,
        gameId,
        module: null,
        mode: GameModeMother.game().value,
      }),
    );

    expect(gameAttemptModulesQuery.findModulesByGameId).toHaveBeenCalledWith(
      gameId,
    );
    expect(updater.execute).toHaveBeenCalledTimes(2);
    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      module: nativeSounds,
    });
    expect(updater.execute).toHaveBeenCalledWith({
      userId,
      module: connectedSpeech,
    });
  });

  it('should skip when userId is null (guest game)', async () => {
    await subscriber.on(
      GameCompletedEventMother.guest({
        module: ModuleNameMother.nativeSounds().value,
      }),
    );

    expect(updater.execute).not.toHaveBeenCalled();
    expect(gameAttemptModulesQuery.findModulesByGameId).not.toHaveBeenCalled();
  });

  it('should delegate to use case with userId and module', async () => {
    const userId = ProgressUserIdMother.random().value;
    const module = ModuleNameMother.nativeSounds().value;

    await subscriber.on(
      GameCompletedEventMother.random({
        userId,
        module,
        mode: GameModeMother.game().value,
      }),
    );

    expect(updater.execute).toHaveBeenCalledWith({ userId, module });
    expect(gameAttemptModulesQuery.findModulesByGameId).not.toHaveBeenCalled();
  });

  it('should subscribe to GameCompletedEvent', () => {
    expect(subscriber.eventName).toBe(GameCompletedEvent.EVENT_NAME);
  });
});
