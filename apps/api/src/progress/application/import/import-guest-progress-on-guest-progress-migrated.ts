import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { ImportGuestProgress } from './import-guest-progress';

@Injectable()
export class ImportGuestProgressOnGuestProgressMigrated extends Subscriber {
  readonly queueName =
    'progress.import_guest_progress_on_guest_progress_migrated';
  readonly eventName = GuestProgressMigratedEvent.EVENT_NAME;
  readonly exchangeName = GuestProgressMigratedEvent.EVENT_NAME;
  readonly domainEvent = GuestProgressMigratedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly importer: ImportGuestProgress,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as { userId: string; guestDeviceId: string };
    await this.importer.execute({
      eventId: event.eventId,
      userId: attrs.userId,
      guestDeviceId: attrs.guestDeviceId,
    });
  }
}
