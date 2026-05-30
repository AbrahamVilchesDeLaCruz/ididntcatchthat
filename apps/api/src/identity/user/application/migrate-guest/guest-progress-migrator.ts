import { Inject, Injectable } from '@nestjs/common';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import {
  type GuestGameMigrationRepository,
  GUEST_GAME_MIGRATION_REPOSITORY,
} from '@/identity/user/domain/guest-game-migration.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestGuestProgressMigrator } from './request-guest-progress-migrator';

export type { RequestGuestProgressMigrator };

@Injectable()
export class GuestProgressMigrator {
  constructor(
    @Inject(GUEST_GAME_MIGRATION_REPOSITORY)
    private readonly repository: GuestGameMigrationRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestGuestProgressMigrator): Promise<void> {
    const { userId, deviceId, guestDeviceId, guestGames } = request;

    if (guestGames.length === 0) return;

    await this.repository.migrateGames(userId, guestGames);

    await this.publisher.publish([
      new GuestProgressMigratedEvent(userId, {
        userId,
        deviceId,
        guestDeviceId,
      }),
    ]);

    this.logger.info('Guest progress migrated', {
      userId,
      gamesCount: guestGames.length,
      guestDeviceId,
    });
  }
}
