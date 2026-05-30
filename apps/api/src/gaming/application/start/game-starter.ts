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
import { GuestGamePolicy } from '@/gaming/domain/guest-game-policy';
import { PausedGamePolicy } from '@/gaming/domain/paused-game-policy';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
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
        { field: 'userId', operator: FilterOperator.EQ, value: null },
        { field: 'startedAt', operator: FilterOperator.GTE, value: today },
        { field: 'cardCount', operator: FilterOperator.LTE, value: 10 },
      ]);
      const todayGames = await this.gameRepository.match(todayCriteria);
      GuestGamePolicy.assertCanStartNewGame(todayGames.length);
    } else {
      const pausedCriteria = new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: userId },
        { field: 'status', operator: FilterOperator.EQ, value: 'paused' },
      ]);
      const pausedGames = await this.gameRepository.match(pausedCriteria);
      PausedGamePolicy.assertCanPauseAnother(pausedGames);
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
