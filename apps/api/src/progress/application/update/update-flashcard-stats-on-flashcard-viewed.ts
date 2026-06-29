import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  FlashcardViewedEvent,
  type FlashcardViewedAttributes,
} from '@/gaming/domain/events/flashcard-viewed.event';
import { FlashcardStatsUpdater } from './flashcard-stats-updater';

@Injectable()
export class FlashcardStatsUpdaterOnFlashcardViewed extends Subscriber {
  readonly queueName = 'progress.update_flashcard_stats_on_flashcard_viewed';
  readonly eventName = 'ididntcatchthat.gaming.views.flashcard.viewed';
  readonly exchangeName = 'ididntcatchthat.gaming.views.flashcard.viewed';
  readonly domainEvent = FlashcardViewedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(FlashcardStatsUpdater)
    private readonly updater: FlashcardStatsUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as FlashcardViewedAttributes;
    if (attrs.userId === null) return;
    await this.updater.execute({
      userId: attrs.userId,
      flashcardId: attrs.flashcardId,
      correct: false,
      mode: 'study',
    });
  }
}
