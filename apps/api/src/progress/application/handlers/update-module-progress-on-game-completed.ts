import { Inject, Injectable } from '@nestjs/common';
import { Handler } from '@/shared/application/handler';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import {
  GameCompletedEvent,
  type GameCompletedAttributes,
} from '@/gaming/domain/events/game-completed.event';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import {
  type ModuleProgressRepository,
  MODULE_PROGRESS_REPOSITORY,
} from '@/progress/domain/module-progress.repository';
import { ModuleProgress } from '@/progress/domain/module-progress';
import { ModuleName } from '@/progress/domain/module-name';
import { ModuleMasteryLevelIncreasedEvent } from '@/progress/domain/events/module-mastery-level-increased.event';
import { UserId } from '@/shared/domain/user-id';

@Injectable()
export class UpdateModuleProgressOnGameCompleted extends Handler {
  readonly queueName = 'progress.update_module_progress_on_game_completed';
  readonly eventName = 'ididntcatchthat.gaming.games.game.completed';
  readonly exchangeName = 'ididntcatchthat.gaming.games.game.completed';
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly statsRepository: UserFlashcardStatsRepository,
    @Inject(MODULE_PROGRESS_REPOSITORY)
    private readonly moduleRepository: ModuleProgressRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {
    super(consumer);
  }

  async handle(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;

    if (attrs.module === null) return;

    const userId = new UserId(attrs.userId as string);
    const module = ModuleName.create(attrs.module);

    const allStats = await this.statsRepository.findByModule(userId, module);
    const totalAttempts = allStats.reduce((sum, s) => sum + s.timesPlayed, 0);
    const correctCount = allStats.reduce((sum, s) => sum + s.correctCount, 0);
    const accuracy = totalAttempts === 0 ? 0 : correctCount / totalAttempts;
    const newMasteryLevel = ModuleProgress.computeMasteryLevel(
      totalAttempts,
      accuracy,
    );

    const existing = await this.moduleRepository.findByModule(userId, module);
    const previousLevel = existing?.masteryLevel ?? -1;

    const updatedAt = new Date();
    const mp = ModuleProgress.fromPrimitives({
      userId: userId.value,
      module: module.value,
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
        new ModuleMasteryLevelIncreasedEvent(userId.value, {
          userId: userId.value,
          module: module.value,
          previousLevel,
          newLevel: newMasteryLevel,
          occurredAt: updatedAt.toISOString(),
        }),
      ]);
    }
  }
}
