import { mock } from 'jest-mock-extended';
import { GuestProgressMigrator } from '@/identity/user/application/migrate-guest/guest-progress-migrator';
import {
  type GuestGameMigrationRepository,
  type GuestGame,
} from '@/identity/user/domain/guest-game-migration.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

const makeGame = (overrides?: { gameId?: string }): GuestGame => ({
  gameId: overrides?.gameId ?? UuidMother.random(),
  phraseId: UuidMother.random(),
  completedAt: new Date(),
  score: 80,
  attempts: [
    {
      attemptId: UuidMother.random(),
      answer: 'test',
      isCorrect: true,
      answeredAt: new Date(),
    },
  ],
});

describe('identity/application/migrate-guest GuestProgressMigrator', () => {
  const guestGameMigrationRepository = mock<GuestGameMigrationRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let useCase: GuestProgressMigrator;

  const params = {
    userId: UuidMother.random(),
    deviceId: UuidMother.random(),
    guestDeviceId: UuidMother.random(),
  };

  beforeEach(() => {
    guestGameMigrationRepository.migrateGames.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    guestGameMigrationRepository.migrateGames.mockResolvedValue(undefined);

    useCase = new GuestProgressMigrator(
      guestGameMigrationRepository,
      publisher,
      logger,
    );
  });

  it('should migrate games and emit GuestProgressMigratedEvent', async () => {
    const games = [makeGame(), makeGame()];

    await useCase.execute({ ...params, guestGames: games });

    expect(guestGameMigrationRepository.migrateGames).toHaveBeenCalledWith(
      params.userId,
      games,
    );
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(GuestProgressMigratedEvent);
  });

  it('should do nothing when guestGames is empty', async () => {
    await useCase.execute({ ...params, guestGames: [] });

    expect(guestGameMigrationRepository.migrateGames).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should emit event with correct attributes', async () => {
    const games = [makeGame()];

    await useCase.execute({ ...params, guestGames: games });

    const events = publisher.publish.mock.calls[0][0];
    const event = events[0];
    expect(event.attributes['userId']).toBe(params.userId);
    expect(event.attributes['guestDeviceId']).toBe(params.guestDeviceId);
  });
});
