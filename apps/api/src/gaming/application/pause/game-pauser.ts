import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';

export interface RequestGamePauser {
  gameId: string;
  userId: string;
  lastFlashcardId: string;
}

@Injectable()
export class GamePauser {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(request: RequestGamePauser): Promise<void> {
    const game = await this.gameRepository.search(new GameId(request.gameId));
    if (!game) throw new GameNotFound(request.gameId);

    if (game.toPrimitives().userId !== request.userId) {
      throw new GameAccessDenied(request.gameId);
    }

    game.pause(request.lastFlashcardId);
    await this.gameRepository.save(game);
  }
}
