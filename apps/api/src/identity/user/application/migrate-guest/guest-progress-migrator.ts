import { Inject, Injectable } from '@nestjs/common';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
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
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestGuestProgressMigrator): Promise<void> {
    const { userId, deviceId, guestDeviceId, guestGames } = request;

    if (guestGames.length === 0) return;

    const gameIds = guestGames.map((g) => g.gameId);

    await this.publisher.publish([
      new GuestProgressMigratedEvent(userId, {
        userId,
        deviceId,
        guestDeviceId,
        gameIds,
      }),
    ]);

    this.logger.info('Guest progress migration requested', {
      userId,
      gamesCount: guestGames.length,
      guestDeviceId,
    });
  }
}
