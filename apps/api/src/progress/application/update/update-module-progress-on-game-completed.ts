import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  GameCompletedEvent,
  type GameCompletedAttributes,
} from '@/gaming/domain/events/game-completed.event';
import {
  type GameAttemptModulesQuery,
  GAME_ATTEMPT_MODULES_QUERY,
} from '@/progress/domain/game-attempt-modules.query';
import { ModuleProgressUpdater } from './module-progress-updater';

@Injectable()
export class ModuleProgressUpdaterOnGameCompleted extends Subscriber {
  readonly queueName = 'progress.update_module_progress_on_game_completed';
  readonly eventName = 'ididntcatchthat.gaming.games.game.completed';
  readonly exchangeName = 'ididntcatchthat.gaming.games.game.completed';
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(ModuleProgressUpdater)
    private readonly updater: ModuleProgressUpdater,
    @Inject(GAME_ATTEMPT_MODULES_QUERY)
    private readonly gameAttemptModulesQuery: GameAttemptModulesQuery,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;
    if (attrs.userId === null) return;

    if (attrs.module !== null) {
      await this.updater.execute({
        userId: attrs.userId,
        module: attrs.module,
      });
      return;
    }

    const modules = await this.gameAttemptModulesQuery.findModulesByGameId(
      attrs.gameId,
    );

    for (const module of modules) {
      await this.updater.execute({
        userId: attrs.userId,
        module,
      });
    }
  }
}
