import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { GuestGamesMigrator } from '@/gaming/application/migrate-guest/guest-games-migrator';

@Injectable()
export class MigrateGuestGamesOnGuestProgressMigrated extends Subscriber {
  readonly queueName = 'gaming.migrate_guest_games_on_guest_progress_migrated';
  readonly eventName = GuestProgressMigratedEvent.EVENT_NAME;
  readonly exchangeName = GuestProgressMigratedEvent.EVENT_NAME;
  readonly domainEvent = GuestProgressMigratedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(GuestGamesMigrator) private readonly migrator: GuestGamesMigrator,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as {
      userId: string;
      gameIds: string[];
    };
    await this.migrator.execute(attrs.userId, attrs.gameIds ?? []);
  }
}
