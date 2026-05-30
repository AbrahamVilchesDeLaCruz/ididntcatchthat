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
import { type RequestGameStarter } from './request-game-starter';
import { type ResponseGameStarter } from './response-game-starter';

export type { RequestGameStarter, ResponseGameStarter };

@Injectable()
export class GameStarter {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(FLASHCARD_SELECTOR)
    private readonly flashcardSelector: FlashcardSelector,
  ) {}

  async execute(request: RequestGameStarter): Promise<ResponseGameStarter> {
    const { userId, mode, module, cardCount } = request;

    if (userId === null) {
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
        { field: 'userId', operator: '=', value: userId },
        { field: 'status', operator: '=', value: 'paused' },
      ]);
      const pausedGames = await this.gameRepository.match(pausedCriteria);
      if (pausedGames.length >= 5) {
        const pausedGameIds = pausedGames.map((g) => g.id.value);
        throw new MaxPausedGamesReached(pausedGameIds);
      }
    }

    const gameModule = module ? GameModule.create(module) : null;
    const flashcardIds = await this.flashcardSelector.select(
      gameModule,
      cardCount,
    );

    const game = Game.start(
      userId,
      mode,
      module,
      String(cardCount),
      flashcardIds,
    );

    await this.gameRepository.save(game);

    return {
      gameId: game.id.value,
      flashcardIds,
    };
  }
}
