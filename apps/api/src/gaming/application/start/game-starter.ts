import { Inject, Injectable } from '@nestjs/common';
import { Game } from '@/gaming/domain/game';
import { GameModule } from '@/gaming/domain/game-module';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import {
  type FlashcardSelector,
  FLASHCARD_SELECTOR,
} from '@/gaming/domain/flashcard-selector';
import { GuestLimitExceeded } from '@/gaming/domain/exceptions/guest-limit-exceeded';
import { MaxPausedGamesReached } from '@/gaming/domain/exceptions/max-paused-games-reached';
import { Criteria } from '@/shared/domain/criteria';

export interface RequestGameStarter {
  userId: string | null;
  mode: string;
  module: string | null;
  cardCount: number;
}

export interface GameStarterResult {
  gameId: string;
  flashcardIds: string[];
}

@Injectable()
export class GameStarter {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(FLASHCARD_SELECTOR)
    private readonly flashcardSelector: FlashcardSelector,
  ) {}

  async execute(request: RequestGameStarter): Promise<GameStarterResult> {
    if (request.userId === null) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCriteria = new Criteria([
        { field: 'userId', operator: '=', value: null },
        { field: 'startedAt', operator: '>=', value: today },
        { field: 'cardCount', operator: '<=', value: 10 },
      ]);
      const todayGames = await this.gameRepository.match(todayCriteria);
      if (todayGames.length >= 3) {
        throw new GuestLimitExceeded();
      }
    } else {
      const pausedCriteria = new Criteria([
        { field: 'userId', operator: '=', value: request.userId },
        { field: 'status', operator: '=', value: 'paused' },
      ]);
      const pausedGames = await this.gameRepository.match(pausedCriteria);
      if (pausedGames.length >= 5) {
        const pausedGameIds = pausedGames.map((g) => g.toPrimitives().id);
        throw new MaxPausedGamesReached(pausedGameIds);
      }
    }

    const gameModule = request.module
      ? GameModule.create(request.module)
      : null;
    const flashcardIds = await this.flashcardSelector.select(
      gameModule,
      request.cardCount,
    );

    const game = Game.start(
      request.userId,
      request.mode,
      request.module,
      String(request.cardCount),
      flashcardIds,
    );

    await this.gameRepository.save(game);

    return {
      gameId: game.toPrimitives().id,
      flashcardIds,
    };
  }
}
