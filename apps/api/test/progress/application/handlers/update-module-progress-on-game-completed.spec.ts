import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { type ModuleProgressRepository } from '@/progress/domain/module-progress.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { UpdateModuleProgressOnGameCompleted } from '@/progress/application/handlers/update-module-progress-on-game-completed';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { ModuleProgressMother } from '@test/progress/domain/module-progress-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';

describe('progress/application/handlers UpdateModuleProgressOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const statsRepository = mock<UserFlashcardStatsRepository>();
  const moduleRepository = mock<ModuleProgressRepository>();
  const publisher = mock<DomainEventPublisher>();
  let handler: UpdateModuleProgressOnGameCompleted;

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
    statsRepository.findByModule.mockReset();
    moduleRepository.findByModule.mockReset();
    moduleRepository.save.mockReset();
    publisher.publish.mockReset();
    moduleRepository.save.mockResolvedValue(undefined);
    publisher.publish.mockResolvedValue(undefined);
    handler = new UpdateModuleProgressOnGameCompleted(
      consumer,
      statsRepository,
      moduleRepository,
      publisher,
    );
  });

  it('should skip when module is null (random game)', async () => {
    await handler.handle(makeEvent({ module: null }));

    expect(statsRepository.findByModule).not.toHaveBeenCalled();
    expect(moduleRepository.save).not.toHaveBeenCalled();
  });

  it('should create ModuleProgress with level 0 on first game', async () => {
    statsRepository.findByModule.mockResolvedValue([
      UserFlashcardStatsMother.withAccuracy(0.3),
    ]);
    moduleRepository.findByModule.mockResolvedValue(null);

    await handler.handle(makeEvent());

    expect(moduleRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should publish ModuleLevelUpEvent when mastery level increases', async () => {
    const userId = ProgressUserIdMother.random().value;
    statsRepository.findByModule.mockResolvedValue(
      Array.from({ length: 6 }, () =>
        UserFlashcardStatsMother.withAccuracy(0.9),
      ),
    );
    const existing = ModuleProgressMother.random({ userId, masteryLevel: 0 });
    moduleRepository.findByModule.mockResolvedValue(existing);

    await handler.handle(makeEvent({ userId }));

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(
      ModuleMasteryLevelIncreasedEvent,
    );
  });

  it('should not publish event when mastery level does not change', async () => {
    const userId = ProgressUserIdMother.random().value;
    statsRepository.findByModule.mockResolvedValue([
      UserFlashcardStatsMother.withAccuracy(0.3),
    ]);
    const existing = ModuleProgressMother.random({ userId, masteryLevel: 0 });
    moduleRepository.findByModule.mockResolvedValue(existing);

    await handler.handle(makeEvent({ userId }));

    expect(moduleRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
