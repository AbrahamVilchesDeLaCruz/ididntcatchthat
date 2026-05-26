import { mock } from 'jest-mock-extended';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type FlashcardSelector } from '@/gaming/domain/flashcard-selector';
import { GameStarter } from '@/gaming/application/start/game-starter';
import { GuestLimitExceeded } from '@/gaming/domain/exceptions/guest-limit-exceeded';
import { MaxPausedGamesReached } from '@/gaming/domain/exceptions/max-paused-games-reached';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestGameStarterMother } from './request-game-starter-mother';

describe('gaming/application/start GameStarter', () => {
  const gameRepository = mock<GameRepository>();
  const flashcardSelector = mock<FlashcardSelector>();
  let starter: GameStarter;

  beforeEach(() => {
    gameRepository.save.mockReset();
    gameRepository.match.mockReset();
    flashcardSelector.select.mockReset();
    starter = new GameStarter(gameRepository, flashcardSelector);
  });

  it('should start a game for an authenticated user', async () => {
    const request = RequestGameStarterMother.random();
    const flashcardIds = ['fc-1', 'fc-2', 'fc-3'];
    gameRepository.match.mockResolvedValue([]);
    flashcardSelector.select.mockResolvedValue(flashcardIds);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await starter.execute(request);

    expect(result.gameId).toBeDefined();
    expect(result.flashcardIds).toEqual(flashcardIds);
    expect(gameRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw GuestLimitExceeded when guest has 3 or more games today', async () => {
    const request = RequestGameStarterMother.guest();
    const todayGames = [
      GameMother.random({ userId: null }),
      GameMother.random({ userId: null }),
      GameMother.random({ userId: null }),
    ];
    gameRepository.match.mockResolvedValue(todayGames);

    await expect(starter.execute(request)).rejects.toThrow(GuestLimitExceeded);
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should allow guest with fewer than 3 games today', async () => {
    const request = RequestGameStarterMother.guest();
    const flashcardIds = ['fc-1', 'fc-2'];
    gameRepository.match.mockResolvedValue([
      GameMother.random({ userId: null }),
    ]);
    flashcardSelector.select.mockResolvedValue(flashcardIds);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await starter.execute(request);

    expect(result.gameId).toBeDefined();
    expect(result.flashcardIds).toEqual(flashcardIds);
  });

  it('should throw MaxPausedGamesReached when user has 5 or more paused games', async () => {
    const request = RequestGameStarterMother.random();
    const pausedGames = [
      GameMother.paused(),
      GameMother.paused(),
      GameMother.paused(),
      GameMother.paused(),
      GameMother.paused(),
    ];
    gameRepository.match.mockResolvedValue(pausedGames);

    await expect(starter.execute(request)).rejects.toThrow(
      MaxPausedGamesReached,
    );
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should start a game with null module', async () => {
    const request = RequestGameStarterMother.random({ module: null });
    const flashcardIds = ['fc-1'];
    gameRepository.match.mockResolvedValue([]);
    flashcardSelector.select.mockResolvedValue(flashcardIds);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await starter.execute(request);

    expect(result.gameId).toBeDefined();
    expect(result.flashcardIds).toEqual(flashcardIds);
  });
});
