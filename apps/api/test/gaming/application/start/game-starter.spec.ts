import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type FlashcardSelector } from '@/gaming/domain/flashcard-selector';
import { GameStarter } from '@/gaming/application/start/game-starter';
import { GuestLimitExceeded } from '@/gaming/domain/exceptions/guest-limit-exceeded';
import { MaxPausedGamesReached } from '@/gaming/domain/exceptions/max-paused-games-reached';
import { GameSubcategoryInvalid } from '@/gaming/domain/exceptions/game-subcategory-invalid';
import { InsufficientWeakFlashcards } from '@/gaming/domain/exceptions/insufficient-weak-flashcards';
import { WeakestSourceRequiresAuth } from '@/gaming/domain/exceptions/weakest-source-requires-auth';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { GameMother } from '@test/gaming/domain/game-mother';
import { type WeakestFlashcardIdsProvider } from '@/gaming/domain/weakest-flashcard-ids.provider';
import { RequestGameStarterMother } from './request-game-starter-mother';
import { NativeSoundsSubcategory } from '@/content/flashcard/domain/subcategory-catalog';

describe('gaming/application/start GameStarter', () => {
  const gameRepository = mock<GameRepository>();
  const flashcardSelector = mock<FlashcardSelector>();
  const weakestProvider = mock<WeakestFlashcardIdsProvider>();
  const logger = mock<Logger>();
  let starter: GameStarter;

  beforeEach(() => {
    gameRepository.save.mockReset();
    gameRepository.match.mockReset();
    flashcardSelector.select.mockReset();
    weakestProvider.findWeakestIds.mockReset();
    starter = new GameStarter(
      gameRepository,
      flashcardSelector,
      weakestProvider,
      logger,
    );
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
    expect(flashcardSelector.select).toHaveBeenCalledWith(
      null,
      null,
      request.cardCount,
    );
  });

  it('should start a game with module and subcategory', async () => {
    const subcategory = NativeSoundsSubcategory.TSoftBetweenVowels;
    const request = RequestGameStarterMother.random({
      module: 'native_sounds',
      subcategory,
    });
    const flashcardIds = ['fc-1', 'fc-2'];
    gameRepository.match.mockResolvedValue([]);
    flashcardSelector.select.mockResolvedValue(flashcardIds);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await starter.execute(request);

    expect(result.gameId).toBeDefined();
    expect(flashcardSelector.select).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'native_sounds' }),
      subcategory,
      request.cardCount,
    );
  });

  it('should throw GameSubcategoryInvalid when subcategory without module', async () => {
    const request = RequestGameStarterMother.random({
      module: null,
      subcategory: NativeSoundsSubcategory.TSoftBetweenVowels,
    });
    gameRepository.match.mockResolvedValue([]);

    await expect(starter.execute(request)).rejects.toThrow(
      GameSubcategoryInvalid,
    );
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should throw GameSubcategoryInvalid when subcategory does not belong to module', async () => {
    const request = RequestGameStarterMother.random({
      module: 'connected_speech',
      subcategory: NativeSoundsSubcategory.TSoftBetweenVowels,
    });
    gameRepository.match.mockResolvedValue([]);

    await expect(starter.execute(request)).rejects.toThrow(
      GameSubcategoryInvalid,
    );
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should throw WeakestSourceRequiresAuth for guest weakest games', async () => {
    const request = RequestGameStarterMother.guest({
      source: GameSourceValue.Weakest,
    });
    gameRepository.match.mockResolvedValue([]);

    await expect(starter.execute(request)).rejects.toThrow(
      WeakestSourceRequiresAuth,
    );
    expect(weakestProvider.findWeakestIds).not.toHaveBeenCalled();
  });

  it('should start a game from weakest flashcards for authenticated users', async () => {
    const request = RequestGameStarterMother.random({
      source: GameSourceValue.Weakest,
      module: 'native_sounds',
      subcategory: null,
    });
    const flashcardIds = ['fc-weak-1', 'fc-weak-2'];
    gameRepository.match.mockResolvedValue([]);
    weakestProvider.findWeakestIds.mockResolvedValue(flashcardIds);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await starter.execute(request);

    expect(result.flashcardIds).toEqual(flashcardIds);
    expect(weakestProvider.findWeakestIds).toHaveBeenCalledWith(
      request.userId,
      request.cardCount,
      request.module,
      request.subcategory,
    );
    expect(flashcardSelector.select).not.toHaveBeenCalled();
  });

  it('should throw InsufficientWeakFlashcards when weakest provider returns none', async () => {
    const request = RequestGameStarterMother.random({
      source: GameSourceValue.Weakest,
    });
    gameRepository.match.mockResolvedValue([]);
    weakestProvider.findWeakestIds.mockResolvedValue([]);

    await expect(starter.execute(request)).rejects.toThrow(
      InsufficientWeakFlashcards,
    );
    expect(gameRepository.save).not.toHaveBeenCalled();
  });
});
