import { Inject, Injectable } from '@nestjs/common';
import { type GamePrimitives } from '@/gaming/domain/game';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';

export interface RequestGameResumer {
  gameId: string;
  userId: string;
}

export interface GameResumerResult {
  game: GamePrimitives;
  pendingFlashcardIds: string[];
}

@Injectable()
export class GameResumer {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(request: RequestGameResumer): Promise<GameResumerResult> {
    const game = await this.gameRepository.search(new GameId(request.gameId));
    if (!game) throw new GameNotFound(request.gameId);

    if (game.toPrimitives().userId !== request.userId) {
      throw new GameAccessDenied(request.gameId);
    }

    game.resume();
    await this.gameRepository.save(game);

    return {
      game: game.toPrimitives(),
      pendingFlashcardIds: game.pendingFlashcardIds(),
    };
  }
}
