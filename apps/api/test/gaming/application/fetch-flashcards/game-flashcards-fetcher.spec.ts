import { mock } from 'jest-mock-extended';
import { GameFlashcardsFetcher } from '@/gaming/application/fetch-flashcards/game-flashcards-fetcher';
import { type GameRepository } from '@/gaming/domain/game.repository';
import {
  type GameFlashcardQuery,
  type GameFlashcardDto,
} from '@/gaming/domain/game-flashcard-query';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameMother } from '@test/gaming/domain/game-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('gaming/application/fetch-flashcards GameFlashcardsFetcher', () => {
  const gameRepository = mock<GameRepository>();
  const flashcardQuery = mock<GameFlashcardQuery>();
  let fetcher: GameFlashcardsFetcher;

  beforeEach(() => {
    gameRepository.search.mockReset();
    flashcardQuery.findByGameId.mockReset();
    fetcher = new GameFlashcardsFetcher(gameRepository, flashcardQuery);
  });

  it('should return flashcards for a valid game', async () => {
    const gameId = UuidMother.random();
    const game = GameMother.random();
    const flashcards: GameFlashcardDto[] = [
      {
        id: UuidMother.random(),
        position: 0,
        expression: 'gonna',
        meaning: 'going to',
        category: 'connected_speech',
        subcategory: 'reduction',
        ipaNotation: '/ˈɡʌnə/',
        nativeSpeech: null,
        audioUrls: null,
        examples: [],
      },
    ];

    gameRepository.search.mockResolvedValueOnce(game);
    flashcardQuery.findByGameId.mockResolvedValueOnce(flashcards);

    const result = await fetcher.execute(gameId);

    expect(result).toEqual(flashcards);
    expect(flashcardQuery.findByGameId).toHaveBeenCalledWith(gameId);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    const gameId = UuidMother.random();
    gameRepository.search.mockResolvedValueOnce(null);

    await expect(fetcher.execute(gameId)).rejects.toThrow(GameNotFound);
    expect(flashcardQuery.findByGameId).not.toHaveBeenCalled();
  });

  it('should return empty array when game has no flashcards', async () => {
    const gameId = UuidMother.random();
    const game = GameMother.random();

    gameRepository.search.mockResolvedValueOnce(game);
    flashcardQuery.findByGameId.mockResolvedValueOnce([]);

    const result = await fetcher.execute(gameId);

    expect(result).toEqual([]);
  });
});
