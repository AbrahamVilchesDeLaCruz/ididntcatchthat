import { mock } from 'jest-mock-extended';
import { GuestGamesMigrator } from '@/gaming/application/migrate-guest/guest-games-migrator';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { Game } from '@/gaming/domain/game';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('gaming/application/migrate-guest GuestGamesMigrator', () => {
  const repository = mock<GameRepository>();
  let migrator: GuestGamesMigrator;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    migrator = new GuestGamesMigrator(repository);
  });

  it('should assign guest games to the user via repository', async () => {
    const userId = UuidMother.random();
    const gameId = UuidMother.random();
    const guestGame = Game.start(null, 'game', null, null, 'catalog', '10', [
      UuidMother.random(),
    ]);

    repository.search.mockResolvedValueOnce(
      Game.fromPrimitives({ ...guestGame.toPrimitives(), id: gameId }),
    );

    await migrator.execute(userId, [gameId]);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.userId).toBe(userId);
  });

  it('should skip games that are already assigned', async () => {
    const userId = UuidMother.random();
    const gameId = UuidMother.random();
    const assignedGame = Game.start(
      UuidMother.random(),
      'game',
      null,
      null,
      'catalog',
      '10',
      [UuidMother.random()],
    );

    repository.search.mockResolvedValueOnce(
      Game.fromPrimitives({ ...assignedGame.toPrimitives(), id: gameId }),
    );

    await migrator.execute(userId, [gameId]);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should do nothing when gameIds is empty', async () => {
    await migrator.execute(UuidMother.random(), []);

    expect(repository.search).not.toHaveBeenCalled();
  });
});
