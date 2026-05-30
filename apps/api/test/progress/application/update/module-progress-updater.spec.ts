import { type RequestModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { type ModuleProgressRepository } from '@/progress/domain/module-progress.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { ModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { ModuleProgressMother } from '@test/progress/domain/module-progress-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';

describe('progress/application/update ModuleProgressUpdater', () => {
  const statsRepository = mock<UserFlashcardStatsRepository>();
  const moduleRepository = mock<ModuleProgressRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let updater: ModuleProgressUpdater;

  const makeRequest = (overrides?: {
    userId?: string;
    module?: string;
  }): RequestModuleProgressUpdater => ({
    userId: overrides?.userId ?? ProgressUserIdMother.random().value,
    module: overrides?.module ?? 'native_sounds',
  });

  beforeEach(() => {
    statsRepository.findByModule.mockReset();
    moduleRepository.findByModule.mockReset();
    moduleRepository.save.mockReset();
    publisher.publish.mockReset();
    moduleRepository.save.mockResolvedValue(undefined);
    publisher.publish.mockResolvedValue(undefined);
    updater = new ModuleProgressUpdater(
      statsRepository,
      moduleRepository,
      publisher,
      logger,
    );
  });

  it('should create ModuleProgress with level 0 on first game', async () => {
    statsRepository.findByModule.mockResolvedValue([
      UserFlashcardStatsMother.withAccuracy(0.3),
    ]);
    moduleRepository.findByModule.mockResolvedValue(null);

    await updater.execute(makeRequest());

    expect(moduleRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should publish ModuleMasteryLevelIncreasedEvent when mastery level increases', async () => {
    const userId = ProgressUserIdMother.random().value;
    statsRepository.findByModule.mockResolvedValue(
      Array.from({ length: 6 }, () =>
        UserFlashcardStatsMother.withAccuracy(0.9),
      ),
    );
    const existing = ModuleProgressMother.random({ userId, masteryLevel: 0 });
    moduleRepository.findByModule.mockResolvedValue(existing);

    await updater.execute(makeRequest({ userId }));

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

    await updater.execute(makeRequest({ userId }));

    expect(moduleRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
