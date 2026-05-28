import { mock } from 'jest-mock-extended';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { GamePauser } from '@/gaming/application/pause/game-pauser';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotInProgress } from '@/gaming/domain/exceptions/game-not-in-progress';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestGamePauserMother } from './request-game-pauser-mother';

describe('gaming/application/pause GamePauser', () => {
  const gameRepository = mock<GameRepository>();
  let pauser: GamePauser;

  beforeEach(() => {
    gameRepository.search.mockReset();
    gameRepository.save.mockReset();
    pauser = new GamePauser(gameRepository);
  });

  it('should pause an in-progress game', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1', 'fc-2'] });
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    gameRepository.save.mockResolvedValue(undefined);

    await pauser.execute(
      RequestGamePauserMother.random(primitives.id, {
        userId: primitives.userId!,
        lastFlashcardId: 'fc-1',
      }),
    );

    expect(gameRepository.save).toHaveBeenCalledTimes(1);
    const savedGame = gameRepository.save.mock.calls[0][0];
    expect(savedGame.toPrimitives().status).toBe('paused');
    expect(savedGame.toPrimitives().lastFlashcardId).toBe('fc-1');
  });

  it('should throw GameNotFound when game does not exist', async () => {
    gameRepository.search.mockResolvedValue(null);

    await expect(
      pauser.execute(RequestGamePauserMother.random()),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.random({ userId: 'owner' });
    gameRepository.search.mockResolvedValue(game);

    await expect(
      pauser.execute(
        RequestGamePauserMother.random(game.toPrimitives().id, {
          userId: 'other',
        }),
      ),
    ).rejects.toThrow(GameAccessDenied);
  });

  it('should throw GameNotInProgress when game is already paused', async () => {
    const game = GameMother.paused();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);

    await expect(
      pauser.execute(
        RequestGamePauserMother.random(primitives.id, {
          userId: primitives.userId!,
        }),
      ),
    ).rejects.toThrow(GameNotInProgress);
  });
});
