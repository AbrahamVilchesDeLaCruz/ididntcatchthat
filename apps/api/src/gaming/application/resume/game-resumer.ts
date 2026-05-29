import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { type RequestGameResumer } from './request-game-resumer';
import { type ResponseGameResumer } from './response-game-resumer';

export type { RequestGameResumer, ResponseGameResumer };

@Injectable()
export class GameResumer {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(request: RequestGameResumer): Promise<ResponseGameResumer> {
    const { gameId, userId } = request;

    const game = await this.gameRepository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    if (game.toPrimitives().userId !== userId) {
      throw new GameAccessDenied(gameId);
    }

    game.resume();
    await this.gameRepository.save(game);

    return {
      game: game.toPrimitives(),
      pendingFlashcardIds: game.pendingFlashcardIds(),
    };
  }
}
