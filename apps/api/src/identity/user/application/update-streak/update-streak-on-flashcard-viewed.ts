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
import { StreakUpdater } from '@/identity/user/application/update-streak/streak-updater';

@Injectable()
export class StreakUpdaterOnFlashcardViewed extends Subscriber {
  readonly queueName = 'identity.update_streak_on_flashcard_viewed';
  readonly eventName = FlashcardViewedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardViewedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardViewedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(StreakUpdater) private readonly updater: StreakUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as FlashcardViewedAttributes;
    if (attrs.userId === null) return;

    await this.updater.execute({
      userId: attrs.userId,
      activityDate: attrs.viewedAt,
    });
  }
}
