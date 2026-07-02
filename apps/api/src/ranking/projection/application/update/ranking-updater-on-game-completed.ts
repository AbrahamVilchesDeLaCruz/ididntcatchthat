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
import { RecordRankingGameCompleted } from '@/ranking/projection/application/update/record-ranking-game-completed';

@Injectable()
export class RankingUpdaterOnGameCompleted extends Subscriber {
  readonly queueName = 'ranking.update_ranking_on_game_completed';
  readonly eventName = 'ididntcatchthat.gaming.games.game.completed';
  readonly exchangeName = 'ididntcatchthat.gaming.games.game.completed';
  readonly domainEvent = GameCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly recorder: RecordRankingGameCompleted,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as GameCompletedAttributes;
    if (attrs.userId === null) return;

    await this.recorder.execute({
      userId: attrs.userId,
      mode: attrs.mode,
      finishedAt: attrs.finishedAt,
    });
  }
}
