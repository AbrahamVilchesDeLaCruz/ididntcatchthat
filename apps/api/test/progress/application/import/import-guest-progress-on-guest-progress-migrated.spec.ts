import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type ImportGuestProgress } from '@/progress/application/import/import-guest-progress';
import { ImportGuestProgressOnGuestProgressMigrated } from '@/progress/application/import/import-guest-progress-on-guest-progress-migrated';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('progress/application/import ImportGuestProgressOnGuestProgressMigrated', () => {
  const consumer = mock<DomainEventConsumer>();
  const importer = mock<ImportGuestProgress>();
  let subscriber: ImportGuestProgressOnGuestProgressMigrated;

  beforeEach(() => {
    importer.execute.mockReset();
    importer.execute.mockResolvedValue(undefined);
    subscriber = new ImportGuestProgressOnGuestProgressMigrated(
      consumer,
      importer,
    );
  });

  it('should delegate to use case with eventId, userId and guestDeviceId', async () => {
    const eventId = UuidMother.random();
    const userId = ProgressUserIdMother.random().value;
    const guestDeviceId = UuidMother.random();
    const event = new GuestProgressMigratedEvent(
      userId,
      { userId, deviceId: UuidMother.random(), guestDeviceId },
      eventId,
    );

    await subscriber.on(event);

    expect(importer.execute).toHaveBeenCalledWith({
      eventId,
      userId,
      guestDeviceId,
    });
  });

  it('should subscribe to GuestProgressMigratedEvent', () => {
    expect(subscriber.eventName).toBe(GuestProgressMigratedEvent.EVENT_NAME);
  });
});
