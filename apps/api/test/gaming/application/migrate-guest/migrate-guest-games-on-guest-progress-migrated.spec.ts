import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { MigrateGuestGamesOnGuestProgressMigrated } from '@/gaming/application/migrate-guest/migrate-guest-games-on-guest-progress-migrated';
import { type GuestGamesMigrator } from '@/gaming/application/migrate-guest/guest-games-migrator';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('gaming/application/migrate-guest MigrateGuestGamesOnGuestProgressMigrated', () => {
  const consumer = mock<DomainEventConsumer>();
  const migrator = mock<GuestGamesMigrator>();
  let handler: MigrateGuestGamesOnGuestProgressMigrated;

  beforeEach(() => {
    migrator.execute.mockReset();
    migrator.execute.mockResolvedValue(undefined);
    handler = new MigrateGuestGamesOnGuestProgressMigrated(consumer, migrator);
  });

  it('should migrate guest games on GuestProgressMigrated', async () => {
    const userId = UuidMother.random();
    const gameIds = [UuidMother.random()];
    const event = new GuestProgressMigratedEvent(userId, {
      userId,
      deviceId: UuidMother.random(),
      guestDeviceId: UuidMother.random(),
      gameIds,
    });

    await handler.on(event);

    expect(migrator.execute).toHaveBeenCalledWith(userId, gameIds);
  });
});
