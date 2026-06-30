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
import { AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';

@Injectable()
export class UpdateAchievementProgressOnFlashcardViewed extends Subscriber {
  readonly queueName = 'achievement.update_progress_on_flashcard_viewed';
  readonly eventName = FlashcardViewedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardViewedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardViewedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly progressUpdater: AchievementProgressUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as FlashcardViewedAttributes;
    await this.progressUpdater.applyFlashcardViewed(attrs);
  }
}
