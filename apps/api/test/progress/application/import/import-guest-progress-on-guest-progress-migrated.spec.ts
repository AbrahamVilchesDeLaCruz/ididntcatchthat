import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type GuestProgressImporter } from '@/progress/application/import/guest-progress-importer';
import { GuestProgressImporterOnGuestProgressMigrated } from '@/progress/application/import/import-guest-progress-on-guest-progress-migrated';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { GuestProgressMigratedEventMother } from '@test/identity/user/domain/guest-progress-migrated-event-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('progress/application/import GuestProgressImporterOnGuestProgressMigrated', () => {
  const consumer = mock<DomainEventConsumer>();
  const importer = mock<GuestProgressImporter>();
  let subscriber: GuestProgressImporterOnGuestProgressMigrated;

  beforeEach(() => {
    importer.execute.mockReset();
    importer.execute.mockResolvedValue(undefined);
    subscriber = new GuestProgressImporterOnGuestProgressMigrated(
      consumer,
      importer,
    );
  });

  it('should delegate to use case with eventId, userId, guestDeviceId and gameIds', async () => {
    const eventId = UuidMother.random();
    const userId = ProgressUserIdMother.random().value;
    const guestDeviceId = UuidMother.random();
    const gameIds = [UuidMother.random()];
    const event = GuestProgressMigratedEventMother.random({
      userId,
      guestDeviceId,
      gameIds,
      eventId,
    });

    await subscriber.on(event);

    expect(importer.execute).toHaveBeenCalledWith({
      eventId,
      userId,
      guestDeviceId,
      gameIds,
    });
  });

  it('should default gameIds to an empty array when missing', async () => {
    const eventId = UuidMother.random();
    const userId = ProgressUserIdMother.random().value;
    const guestDeviceId = UuidMother.random();
    const event = GuestProgressMigratedEventMother.withoutGameIds({
      userId,
      guestDeviceId,
      eventId,
    });

    await subscriber.on(event);

    expect(importer.execute).toHaveBeenCalledWith({
      eventId,
      userId,
      guestDeviceId,
      gameIds: [],
    });
  });

  it('should subscribe to GuestProgressMigratedEvent', () => {
    expect(subscriber.eventName).toBe(GuestProgressMigratedEvent.EVENT_NAME);
  });
});
