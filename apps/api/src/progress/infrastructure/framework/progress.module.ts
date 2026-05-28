import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { USER_FLASHCARD_STATS_REPOSITORY } from '@/progress/domain/user-flashcard-stats.repository';
import { MODULE_PROGRESS_REPOSITORY } from '@/progress/domain/module-progress.repository';
import { PROCESSED_EVENTS_REPOSITORY } from '@/shared/domain/processed-events.repository';
import { GUEST_ATTEMPT_REPOSITORY } from '@/progress/domain/guest-attempt.repository';

// Infrastructure — entities
import { UserFlashcardStatsEntity } from '@/progress/infrastructure/persistence/typeorm/user-flashcard-stats.entity';
import { ModuleProgressEntity } from '@/progress/infrastructure/persistence/typeorm/module-progress.entity';
import { ProcessedEventEntity } from '@/shared/infrastructure/persistence/inbox/processed-event.entity';

// Infrastructure — repositories
import { TypeOrmUserFlashcardStatsRepository } from '@/progress/infrastructure/persistence/typeorm/typeorm-user-flashcard-stats.repository';
import { TypeOrmModuleProgressRepository } from '@/progress/infrastructure/persistence/typeorm/typeorm-module-progress.repository';
import { TypeOrmProcessedEventsRepository } from '@/shared/infrastructure/persistence/inbox/typeorm-processed-events.repository';
import { TypeOrmGuestAttemptRepository } from '@/progress/infrastructure/persistence/typeorm/typeorm-guest-attempt.repository';
// Infrastructure — controllers
import { GetModulesProgressGetController } from '@/progress/infrastructure/controllers/get-modules-progress-get.controller';
import { GetWeakestFlashcardsGetController } from '@/progress/infrastructure/controllers/get-weakest-flashcards-get.controller';

// Infrastructure — event bus
import {
  HANDLERS,
  HandlersBootstrapper,
} from '@/shared/infrastructure/event-bus/handlers-bootstrapper';
import { Handler } from '@/shared/application/handler';

// Application — use cases
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';

// Application — event handlers
import { UpdateFlashcardStatsOnAttemptRecorded } from '@/progress/application/handlers/update-flashcard-stats-on-attempt-recorded';
import { UpdateModuleProgressOnGameCompleted } from '@/progress/application/handlers/update-module-progress-on-game-completed';
import { ImportGuestProgressOnGuestProgressMigrated } from '@/progress/application/handlers/import-guest-progress-on-guest-progress-migrated';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      UserFlashcardStatsEntity,
      ModuleProgressEntity,
      ProcessedEventEntity,
    ]),
  ],
  controllers: [
    GetModulesProgressGetController,
    GetWeakestFlashcardsGetController,
  ],
  providers: [
    // Repositories
    {
      provide: USER_FLASHCARD_STATS_REPOSITORY,
      useClass: TypeOrmUserFlashcardStatsRepository,
    },
    {
      provide: MODULE_PROGRESS_REPOSITORY,
      useClass: TypeOrmModuleProgressRepository,
    },
    {
      provide: PROCESSED_EVENTS_REPOSITORY,
      useClass: TypeOrmProcessedEventsRepository,
    },
    {
      provide: GUEST_ATTEMPT_REPOSITORY,
      useClass: TypeOrmGuestAttemptRepository,
    },

    // Use cases
    ModuleProgressFinder,
    WeakestFlashcardSearcher,

    // Event handlers
    UpdateFlashcardStatsOnAttemptRecorded,
    UpdateModuleProgressOnGameCompleted,
    ImportGuestProgressOnGuestProgressMigrated,
    {
      provide: HANDLERS,
      useFactory: (
        h1: UpdateFlashcardStatsOnAttemptRecorded,
        h2: UpdateModuleProgressOnGameCompleted,
        h3: ImportGuestProgressOnGuestProgressMigrated,
      ): Handler[] => [h1, h2, h3],
      inject: [
        UpdateFlashcardStatsOnAttemptRecorded,
        UpdateModuleProgressOnGameCompleted,
        ImportGuestProgressOnGuestProgressMigrated,
      ],
    },
    HandlersBootstrapper,
  ],
})
export class ProgressModule {}
