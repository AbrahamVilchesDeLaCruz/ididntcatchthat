import { mock } from 'jest-mock-extended';
import { GuestProgressMigrator } from '@/identity/user/application/migrate-guest/guest-progress-migrator';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/application/migrate-guest GuestProgressMigrator', () => {
  const userRepository = mock<UserRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let useCase: GuestProgressMigrator;

  const params = {
    userId: UuidMother.random(),
    deviceId: UuidMother.random(),
    guestDeviceId: UuidMother.random(),
  };

  beforeEach(() => {
    userRepository.search.mockReset();
    userRepository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);

    useCase = new GuestProgressMigrator(userRepository, publisher, logger);
  });

  it('should publish GuestProgressMigratedEvent recorded by User aggregate', async () => {
    const user = UserMother.random({ id: params.userId });
    const gameId = UuidMother.random();
    userRepository.search.mockResolvedValueOnce(user);

    await useCase.execute({ ...params, guestGames: [{ gameId }] });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(GuestProgressMigratedEvent);
    expect(events[0].attributes['gameIds']).toEqual([gameId]);
  });

  it('should do nothing when guestGames is empty', async () => {
    await useCase.execute({ ...params, guestGames: [] });

    expect(userRepository.search).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
