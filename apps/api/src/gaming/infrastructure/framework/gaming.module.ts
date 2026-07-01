import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { GAME_REPOSITORY } from '@/gaming/domain/game.repository';
import { ATTEMPT_REPOSITORY } from '@/gaming/domain/attempt.repository';
import { FLASHCARD_SELECTOR } from '@/gaming/domain/flashcard-selector';
import { GAME_FLASHCARD_QUERY } from '@/gaming/domain/game-flashcard-query';
import { FLASHCARD_CATEGORY_QUERY } from '@/gaming/domain/flashcard-category.query';

// Infrastructure — persistence
import { GameEntity } from '@/gaming/infrastructure/persistence/game.entity';
import { GameFlashcardEntity } from '@/gaming/infrastructure/persistence/game-flashcard.entity';
import { TypeOrmGameRepository } from '@/gaming/infrastructure/persistence/typeorm-game.repository';
import { TypeOrmAttemptRepository } from '@/gaming/infrastructure/persistence/typeorm-attempt.repository';
import { TypeOrmGameFlashcardQuery } from '@/gaming/infrastructure/persistence/typeorm-game-flashcard-query';
import { TypeOrmFlashcardCategoryQuery } from '@/gaming/infrastructure/persistence/typeorm-flashcard-category.query';

// Infrastructure — selectors
import { TypeOrmFlashcardSelector } from '@/gaming/infrastructure/selectors/typeorm-flashcard-selector';

// Infrastructure — controllers
import { StartGamePostController } from '@/gaming/infrastructure/controllers/start-game-post.controller';
import { RecordAttemptPostController } from '@/gaming/infrastructure/controllers/record-attempt-post.controller';
import { CompleteGamePostController } from '@/gaming/infrastructure/controllers/complete-game-post.controller';
import { FindGameSummaryGetController } from '@/gaming/infrastructure/controllers/find-game-summary-get.controller';
import { PatchGamePatchController } from '@/gaming/infrastructure/controllers/patch-game-patch.controller';
import { SearchGamesGetController } from '@/gaming/infrastructure/controllers/search-games-get.controller';
import { ResumeGamePostController } from '@/gaming/infrastructure/controllers/resume-game-post.controller';
import { SearchGameFlashcardsGetController } from '@/gaming/infrastructure/controllers/search-game-flashcards-get.controller';
import { SearchGamesStatsGetController } from '@/gaming/infrastructure/controllers/search-games-stats-get.controller';
import { TypeOrmGameStatsQuery } from '@/gaming/infrastructure/persistence/typeorm-game-stats.query';
import { GAME_STATS_QUERY } from '@/gaming/application/stats/game-stats.query';
import { GameStatsRetriever } from '@/gaming/application/stats/game-stats-retriever';

// Infrastructure — exception registry
import { GamingExceptionRegistry } from './gaming-exception-registry';

// Application — use cases
import { GameStarter } from '@/gaming/application/start/game-starter';
import { AttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { GameCompleter } from '@/gaming/application/complete/game-completer';
import { GameSummaryFinder } from '@/gaming/application/summary/game-summary-finder';
import { GamePauser } from '@/gaming/application/pause/game-pauser';
import { PausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { GameResumer } from '@/gaming/application/resume/game-resumer';
import { GameAbandoner } from '@/gaming/application/abandon/game-abandoner';
import { GameFlashcardsFetcher } from '@/gaming/application/fetch-flashcards/game-flashcards-fetcher';
import { VIEW_REPOSITORY } from '@/gaming/domain/view.repository';
import { RecordViewPostController } from '@/gaming/infrastructure/controllers/record-view-post.controller';
import { TypeOrmViewRepository } from '@/gaming/infrastructure/persistence/typeorm-view.repository';
import { ViewRecorder } from '@/gaming/application/view/view-recorder';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { ProgressModule } from '@/progress/infrastructure/framework/progress.module';
import { WEAKEST_FLASHCARD_IDS_PROVIDER } from '@/gaming/domain/weakest-flashcard-ids.provider';
import { ProgressWeakestFlashcardIdsProvider } from '@/gaming/infrastructure/providers/progress-weakest-flashcard-ids.provider';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    ProgressModule,
    TypeOrmModule.forFeature([GameEntity, GameFlashcardEntity]),
  ],
  controllers: [
    StartGamePostController,
    SearchGamesStatsGetController,
    SearchGamesGetController,
    RecordAttemptPostController,
    RecordViewPostController,
    CompleteGamePostController,
    FindGameSummaryGetController,
    PatchGamePatchController,
    ResumeGamePostController,
    SearchGameFlashcardsGetController,
  ],
  providers: [
    // Repositories
    { provide: ATTEMPT_REPOSITORY, useClass: TypeOrmAttemptRepository },
    { provide: VIEW_REPOSITORY, useClass: TypeOrmViewRepository },
    { provide: GAME_REPOSITORY, useClass: TypeOrmGameRepository },
    { provide: FLASHCARD_SELECTOR, useClass: TypeOrmFlashcardSelector },
    { provide: GAME_FLASHCARD_QUERY, useClass: TypeOrmGameFlashcardQuery },
    {
      provide: FLASHCARD_CATEGORY_QUERY,
      useClass: TypeOrmFlashcardCategoryQuery,
    },
    {
      provide: WEAKEST_FLASHCARD_IDS_PROVIDER,
      useClass: ProgressWeakestFlashcardIdsProvider,
    },

    // Queries
    { provide: GAME_STATS_QUERY, useClass: TypeOrmGameStatsQuery },

    // Use cases
    GameStatsRetriever,
    GameStarter,
    AttemptRecorder,
    ViewRecorder,
    GameCompleter,
    GameSummaryFinder,
    GamePauser,
    PausedGamesLister,
    GameResumer,
    GameAbandoner,
    GameFlashcardsFetcher,

    // Exception registry
    GamingExceptionRegistry,
  ],
})
export class GamingModule {}
