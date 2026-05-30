import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { GameResumer } from '@/gaming/application/resume/game-resumer';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotPaused } from '@/gaming/domain/exceptions/game-not-paused';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestGameResumerMother } from './request-game-resumer-mother';

describe('gaming/application/resume GameResumer', () => {
  const gameRepository = mock<GameRepository>();
  const logger = mock<Logger>();
  let resumer: GameResumer;

  beforeEach(() => {
    gameRepository.search.mockReset();
    gameRepository.save.mockReset();
    resumer = new GameResumer(gameRepository, logger);
  });

  it('should resume a paused game and return pendingFlashcardIds', async () => {
    const game = GameMother.paused();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await resumer.execute(
      RequestGameResumerMother.random(primitives.id, {
        userId: primitives.userId!,
      }),
    );

    expect(result.game.status).toBe('in_progress');
    expect(Array.isArray(result.pendingFlashcardIds)).toBe(true);
    expect(gameRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    gameRepository.search.mockResolvedValue(null);

    await expect(
      resumer.execute(RequestGameResumerMother.random()),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.paused();
    gameRepository.search.mockResolvedValue(game);

    await expect(
      resumer.execute(
        RequestGameResumerMother.random(game.toPrimitives().id, {
          userId: 'other',
        }),
      ),
    ).rejects.toThrow(GameAccessDenied);
  });

  it('should throw GameNotPaused when game is in_progress', async () => {
    const game = GameMother.random();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);

    await expect(
      resumer.execute(
        RequestGameResumerMother.random(primitives.id, {
          userId: primitives.userId!,
        }),
      ),
    ).rejects.toThrow(GameNotPaused);
  });
});
