import { type RequestUpdateModuleProgress } from '@/progress/application/update/update-module-progress';
import { mock } from 'jest-mock-extended';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { type ModuleProgressRepository } from '@/progress/domain/module-progress.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { UpdateModuleProgress } from '@/progress/application/update/update-module-progress';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { ModuleProgressMother } from '@test/progress/domain/module-progress-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';

describe('progress/application/update UpdateModuleProgress', () => {
  const statsRepository = mock<UserFlashcardStatsRepository>();
  const moduleRepository = mock<ModuleProgressRepository>();
  const publisher = mock<DomainEventPublisher>();
  let useCase: UpdateModuleProgress;

  const makeRequest = (overrides?: {
    userId?: string;
    module?: string;
  }): RequestUpdateModuleProgress => ({
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
    useCase = new UpdateModuleProgress(
      statsRepository,
      moduleRepository,
      publisher,
    );
  });

  it('should create ModuleProgress with level 0 on first game', async () => {
    statsRepository.findByModule.mockResolvedValue([
      UserFlashcardStatsMother.withAccuracy(0.3),
    ]);
    moduleRepository.findByModule.mockResolvedValue(null);

    await useCase.execute(makeRequest());

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

    await useCase.execute(makeRequest({ userId }));

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

    await useCase.execute(makeRequest({ userId }));

    expect(moduleRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
