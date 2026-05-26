import { Inject, Injectable } from '@nestjs/common';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import {
  type GameFlashcardQuery,
  type GameFlashcardDto,
  GAME_FLASHCARD_QUERY,
} from '@/gaming/domain/game-flashcard-query';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { GameId } from '@/gaming/domain/game-id';

@Injectable()
export class GameFlashcardsFetcher {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(GAME_FLASHCARD_QUERY)
    private readonly flashcardQuery: GameFlashcardQuery,
  ) {}

  async execute(gameId: string): Promise<GameFlashcardDto[]> {
    const game = await this.gameRepository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    return this.flashcardQuery.findByGameId(gameId);
  }
}
