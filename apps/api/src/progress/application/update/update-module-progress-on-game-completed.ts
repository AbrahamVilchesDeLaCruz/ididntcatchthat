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
import { ModuleProgressUpdater } from './module-progress-updater';

@Injectable()
export class ModuleProgressUpdaterOnGameCompleted extends Subscriber {
  readonly queueName = 'progress.update_module_progress_on_game_completed';
  readonly eventName = 'ididntcatchthat.gaming.games.game.completed';
  readonly exchangeName = 'ididntcatchthat.gaming.games.game.completed';
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly updater: ModuleProgressUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;
    if (attrs.module === null) return;
    if (attrs.userId === null) return;
    await this.updater.execute({
      userId: attrs.userId,
      module: attrs.module,
    });
  }
}
