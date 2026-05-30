import { mock } from 'jest-mock-extended';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { PausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestPausedGamesListerMother } from './request-paused-games-lister-mother';

describe('gaming/application/list-paused PausedGamesLister', () => {
  const repository = mock<GameRepository>();
  let lister: PausedGamesLister;

  beforeEach(() => {
    repository.match.mockReset();
    lister = new PausedGamesLister(repository);
  });

  it('should return paused games for the user', async () => {
    const pausedGames = [GameMother.paused(), GameMother.paused()];
    repository.match.mockResolvedValue(pausedGames);

    const result = await lister.execute(
      RequestPausedGamesListerMother.random('user-abc'),
    );

    expect(result).toHaveLength(2);
    expect(result[0].status).toBe('paused');
  });

  it('should return empty array when no paused games', async () => {
    repository.match.mockResolvedValue([]);

    const result = await lister.execute(
      RequestPausedGamesListerMother.random('user-abc'),
    );

    expect(result).toEqual([]);
  });
});
