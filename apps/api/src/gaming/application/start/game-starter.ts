import { Inject, Injectable } from '@nestjs/common';
import { Game } from '@/gaming/domain/game';
import { GameModule } from '@/gaming/domain/game-module';
import { GameSource, GameSourceValue } from '@/gaming/domain/game-source';
import { LearningModule } from '@/shared/domain/learning-module';
import { SUBCATEGORY_BY_CATEGORY } from '@/content/flashcard/domain/subcategory-catalog';
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
import { GameMode } from '@/gaming/domain/game-mode';
import { StudyRequiresAuth } from '@/gaming/domain/exceptions/study-requires-auth';
import { WeakestSourceRequiresGameMode } from '@/gaming/domain/exceptions/weakest-source-requires-game-mode';
import { GameSubcategoryInvalid } from '@/gaming/domain/exceptions/game-subcategory-invalid';
import { InsufficientWeakFlashcards } from '@/gaming/domain/exceptions/insufficient-weak-flashcards';
import { WeakestSourceRequiresAuth } from '@/gaming/domain/exceptions/weakest-source-requires-auth';
import {
  type WeakestFlashcardIdsProvider,
  WEAKEST_FLASHCARD_IDS_PROVIDER,
} from '@/gaming/domain/weakest-flashcard-ids.provider';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics';
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
    @Inject(WEAKEST_FLASHCARD_IDS_PROVIDER)
    private readonly weakestFlashcardIdsProvider: WeakestFlashcardIdsProvider,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    @Inject(APP_METRICS)
    private readonly metrics: AppMetrics,
  ) {}

  async execute(request: RequestGameStarter): Promise<ResponseGameStarter> {
    const { userId, mode, module, subcategory, cardCount, source } = request;
    const gameSource = GameSource.create(source ?? GameSourceValue.Catalog);

    if (GameMode.create(mode).isStudy()) {
      if (userId === null) {
        throw new StudyRequiresAuth();
      }
      if (gameSource.isWeakest()) {
        throw new WeakestSourceRequiresGameMode();
      }
    }

    this.assertValidScope(module, subcategory);

    if (gameSource.isWeakest() && userId === null) {
      throw new WeakestSourceRequiresAuth();
    }

    if (userId === null) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCriteria = new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: null },
        { field: 'startedAt', operator: FilterOperator.GTE, value: today },
        {
          field: 'cardCount',
          operator: FilterOperator.LTE,
          value: GuestGamePolicy.MAX_CARD_COUNT_FOR_GUEST,
        },
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

    let flashcardIds: string[];

    if (gameSource.isWeakest()) {
      flashcardIds = await this.weakestFlashcardIdsProvider.findWeakestIds(
        userId!,
        cardCount,
        module,
        subcategory,
      );
      if (flashcardIds.length === 0) {
        throw new InsufficientWeakFlashcards();
      }
    } else {
      const gameModule = module ? GameModule.create(module) : null;
      flashcardIds = await this.flashcardSelector.select(
        gameModule,
        subcategory,
        cardCount,
      );
    }

    const game = Game.start(
      userId,
      mode,
      module,
      subcategory,
      gameSource.value,
      String(cardCount),
      flashcardIds,
    );

    await this.gameRepository.save(game);

    this.logger.info('Game started', {
      gameId: game.id.value,
      userId: userId ?? 'guest',
      mode,
      module: module ?? null,
      subcategory,
      cardCount,
    });

    this.metrics.increment('app_games_started_total');

    return {
      gameId: game.id.value,
      flashcardIds,
    };
  }

  private assertValidScope(
    module: string | null,
    subcategory: string | null,
  ): void {
    if (subcategory !== null && module === null) {
      throw new GameSubcategoryInvalid();
    }

    if (module === null) {
      return;
    }

    if (subcategory === null) {
      return;
    }

    const valid = SUBCATEGORY_BY_CATEGORY[module as LearningModule];
    if (!valid?.has(subcategory)) {
      throw new GameSubcategoryInvalid();
    }
  }
}
