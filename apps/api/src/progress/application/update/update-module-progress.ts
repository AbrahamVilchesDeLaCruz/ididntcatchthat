import { Inject, Injectable } from '@nestjs/common';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import {
  type ModuleProgressRepository,
  MODULE_PROGRESS_REPOSITORY,
} from '@/progress/domain/module-progress.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { ModuleProgress } from '@/progress/domain/module-progress';
import { ModuleName } from '@/progress/domain/module-name';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { UserId } from '@/shared/domain/user-id';
import { type RequestUpdateModuleProgress } from './request-update-module-progress';

export type { RequestUpdateModuleProgress };

@Injectable()
export class UpdateModuleProgress {
  constructor(
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly statsRepository: UserFlashcardStatsRepository,
    @Inject(MODULE_PROGRESS_REPOSITORY)
    private readonly moduleRepository: ModuleProgressRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute({
    userId,
    module,
  }: RequestUpdateModuleProgress): Promise<void> {
    const uid = new UserId(userId);
    const mod = ModuleName.create(module);

    const [allStats, existing] = await Promise.all([
      this.statsRepository.findByModule(uid, mod),
      this.moduleRepository.findByModule(uid, mod),
    ]);

    const { progress, levelIncreased, newLevel, previousLevel } =
      ModuleProgress.computeFrom(allStats, existing, uid, mod);

    await this.moduleRepository.save(progress);

    if (levelIncreased) {
      await this.publisher.publish([
        new ModuleMasteryLevelIncreasedEvent(uid.value, {
          userId: uid.value,
          module: mod.value,
          previousLevel,
          newLevel,
          occurredAt: progress.updatedAt.toISOString(),
        }),
      ]);
    }
  }
}
