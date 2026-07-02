import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  AttemptRecordedEvent,
  type AttemptRecordedAttributes,
} from '@/gaming/domain/events/attempt-recorded.event';
import { AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';

@Injectable()
export class UpdateAchievementProgressOnAttemptRecorded extends Subscriber {
  readonly queueName = 'achievement.update_progress_on_attempt_recorded';
  readonly eventName = AttemptRecordedEvent.EVENT_NAME;
  readonly exchangeName = AttemptRecordedEvent.EVENT_NAME;
  readonly domainEvent = AttemptRecordedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly progressUpdater: AchievementProgressUpdater,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as AttemptRecordedAttributes;
    await this.progressUpdater.applyAttemptRecorded(attrs);
  }
}
