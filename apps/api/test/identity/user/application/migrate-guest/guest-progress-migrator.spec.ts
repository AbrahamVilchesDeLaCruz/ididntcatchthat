import { mock } from 'jest-mock-extended';
import { GuestProgressMigrator } from '@/identity/user/application/migrate-guest/guest-progress-migrator';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/application/migrate-guest GuestProgressMigrator', () => {
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let useCase: GuestProgressMigrator;

  const params = {
    userId: UuidMother.random(),
    deviceId: UuidMother.random(),
    guestDeviceId: UuidMother.random(),
  };

  beforeEach(() => {
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);

    useCase = new GuestProgressMigrator(publisher, logger);
  });

  it('should publish GuestProgressMigratedEvent with gameIds', async () => {
    const gameId = UuidMother.random();
    const games = [{ gameId }];

    await useCase.execute({ ...params, guestGames: games });

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(GuestProgressMigratedEvent);
    expect(events[0].attributes['gameIds']).toEqual([gameId]);
  });

  it('should do nothing when guestGames is empty', async () => {
    await useCase.execute({ ...params, guestGames: [] });

    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
