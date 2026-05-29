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

    const allStats = await this.statsRepository.findByModule(uid, mod);
    const totalAttempts = allStats.reduce((sum, s) => sum + s.timesPlayed, 0);
    const correctCount = allStats.reduce((sum, s) => sum + s.correctCount, 0);
    const accuracy = totalAttempts === 0 ? 0 : correctCount / totalAttempts;
    const newMasteryLevel = ModuleProgress.computeMasteryLevel(
      totalAttempts,
      accuracy,
    );

    const existing = await this.moduleRepository.findByModule(uid, mod);
    const previousLevel = existing?.masteryLevel ?? -1;

    const updatedAt = new Date();
    const mp = ModuleProgress.fromPrimitives({
      userId: uid.value,
      module: mod.value,
      totalAttempts,
      correctCount,
      accuracy,
      masteryLevel: newMasteryLevel,
      lastPlayedAt: updatedAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });

    await this.moduleRepository.save(mp);

    if (newMasteryLevel > previousLevel && previousLevel >= 0) {
      await this.publisher.publish([
        new ModuleMasteryLevelIncreasedEvent(uid.value, {
          userId: uid.value,
          module: mod.value,
          previousLevel,
          newLevel: newMasteryLevel,
          occurredAt: updatedAt.toISOString(),
        }),
      ]);
    }
  }
}
