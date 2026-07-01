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
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { UserId } from '@/shared/domain/user-id';
import { type RequestModuleProgressUpdater } from './request-update-module-progress';

export type { RequestModuleProgressUpdater };

@Injectable()
export class ModuleProgressUpdater {
  constructor(
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly statsRepository: UserFlashcardStatsRepository,
    @Inject(MODULE_PROGRESS_REPOSITORY)
    private readonly moduleRepository: ModuleProgressRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute({
    userId,
    module,
  }: RequestModuleProgressUpdater): Promise<void> {
    const uid = new UserId(userId);
    const mod = ModuleName.create(module);

    const [allStats, existing] = await Promise.all([
      this.statsRepository.findByModule(uid, mod),
      this.moduleRepository.findByModule(uid, mod),
    ]);

    const { progress, levelIncreased, newLevel, previousLevel } =
      ModuleProgress.computeFrom(allStats, existing, uid, mod);

    await this.moduleRepository.save(progress);

    const events = progress.pullDomainEvents();
    if (events.length === 0) return;

    if (levelIncreased) {
      this.logger.info('Module mastery level increased', {
        userId,
        module,
        previousLevel,
        newLevel,
      });
    }

    await this.publisher.publish(events);
  }
}
