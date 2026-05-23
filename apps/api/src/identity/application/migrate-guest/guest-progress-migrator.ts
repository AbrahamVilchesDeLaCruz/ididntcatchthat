import { Inject, Injectable } from '@nestjs/common';
import { GuestProgressMigratedEvent } from '@/identity/domain/events/guest-progress-migrated.event';
import {
  type GuestGameMigrationRepository,
  GUEST_GAME_MIGRATION_REPOSITORY,
  GuestGame,
} from '@/identity/domain/guest-game-migration.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';

@Injectable()
export class GuestProgressMigrator {
  constructor(
    @Inject(GUEST_GAME_MIGRATION_REPOSITORY)
    private readonly guestGameMigrationRepository: GuestGameMigrationRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(params: {
    userId: string;
    deviceId: string;
    guestDeviceId: string;
    guestGames: GuestGame[];
  }): Promise<void> {
    if (params.guestGames.length === 0) return;

    await this.guestGameMigrationRepository.migrateGames(
      params.userId,
      params.guestGames,
    );

    await this.publisher.publish([
      new GuestProgressMigratedEvent(params.userId, {
        userId: params.userId,
        deviceId: params.deviceId,
        guestDeviceId: params.guestDeviceId,
      }),
    ]);
  }
}
