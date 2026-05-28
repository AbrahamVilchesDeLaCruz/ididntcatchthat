import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { GAME_REPOSITORY } from '@/gaming/domain/game.repository';
import { ATTEMPT_REPOSITORY } from '@/gaming/domain/attempt.repository';
import { FLASHCARD_SELECTOR } from '@/gaming/domain/flashcard-selector';
import { GAME_FLASHCARD_QUERY } from '@/gaming/domain/game-flashcard-query';

// Infrastructure — persistence
import { GameEntity } from '@/gaming/infrastructure/persistence/game.entity';
import { GameFlashcardEntity } from '@/gaming/infrastructure/persistence/game-flashcard.entity';
import { TypeOrmGameRepository } from '@/gaming/infrastructure/persistence/typeorm-game.repository';
import { TypeOrmAttemptRepository } from '@/gaming/infrastructure/persistence/typeorm-attempt.repository';
import { TypeOrmGameFlashcardQuery } from '@/gaming/infrastructure/persistence/typeorm-game-flashcard-query';

// Infrastructure — selectors
import { TypeOrmFlashcardSelector } from '@/gaming/infrastructure/selectors/typeorm-flashcard-selector';

// Infrastructure — controllers
import { StartGamePostController } from '@/gaming/infrastructure/controllers/start-game-post.controller';
import { RecordAttemptPostController } from '@/gaming/infrastructure/controllers/record-attempt-post.controller';
import { CompleteGamePostController } from '@/gaming/infrastructure/controllers/complete-game-post.controller';
import { PatchGameController } from '@/gaming/infrastructure/controllers/patch-game.controller';
import { ListPausedGamesGetController } from '@/gaming/infrastructure/controllers/list-paused-games-get.controller';
import { ResumeGameGetController } from '@/gaming/infrastructure/controllers/resume-game-get.controller';
import { GetGameFlashcardsController } from '@/gaming/infrastructure/controllers/get-game-flashcards.controller';

// Infrastructure — exception registry
import { GamingExceptionRegistry } from './gaming-exception-registry';

// Application — use cases
import { GameStarter } from '@/gaming/application/start/game-starter';
import { AttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { GameCompleter } from '@/gaming/application/complete/game-completer';
import { GamePauser } from '@/gaming/application/pause/game-pauser';
import { PausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { GameResumer } from '@/gaming/application/resume/game-resumer';
import { GameAbandoner } from '@/gaming/application/abandon/game-abandoner';
import { GameFlashcardsFetcher } from '@/gaming/application/fetch-flashcards/game-flashcards-fetcher';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([GameEntity, GameFlashcardEntity]),
  ],
  controllers: [
    StartGamePostController,
    RecordAttemptPostController,
    CompleteGamePostController,
    PatchGameController,
    ListPausedGamesGetController,
    ResumeGameGetController,
    GetGameFlashcardsController,
  ],
  providers: [
    // Repositories
    { provide: ATTEMPT_REPOSITORY, useClass: TypeOrmAttemptRepository },
    { provide: GAME_REPOSITORY, useClass: TypeOrmGameRepository },
    { provide: FLASHCARD_SELECTOR, useClass: TypeOrmFlashcardSelector },
    { provide: GAME_FLASHCARD_QUERY, useClass: TypeOrmGameFlashcardQuery },

    // Use cases
    GameStarter,
    AttemptRecorder,
    GameCompleter,
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
