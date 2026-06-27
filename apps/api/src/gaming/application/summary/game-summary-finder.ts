import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotFinished } from '@/gaming/domain/exceptions/game-not-finished';
import { type RequestGameSummaryFinder } from './request-game-summary-finder';
import { type ResponseGameSummaryFinder } from './response-game-summary-finder';

export type { RequestGameSummaryFinder, ResponseGameSummaryFinder };

@Injectable()
export class GameSummaryFinder {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly repository: GameRepository,
  ) {}

  async execute(
    request: RequestGameSummaryFinder,
  ): Promise<ResponseGameSummaryFinder> {
    const { gameId, userId } = request;

    const game = await this.repository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    if (game.userId !== userId) {
      throw new GameAccessDenied(gameId);
    }

    const pending = game.pendingFlashcardIds();
    if (pending.length > 0) {
      throw new GameNotFinished(gameId, pending.length);
    }

    return game.completionStats();
  }
}
