import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { type RequestGamePauser } from './request-game-pauser';

export type { RequestGamePauser };

@Injectable()
export class GamePauser {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(request: RequestGamePauser): Promise<void> {
    const { gameId, userId, lastFlashcardId } = request;

    const game = await this.gameRepository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    if (game.toPrimitives().userId !== userId) {
      throw new GameAccessDenied(gameId);
    }

    game.pause(lastFlashcardId);
    await this.gameRepository.save(game);
  }
}
