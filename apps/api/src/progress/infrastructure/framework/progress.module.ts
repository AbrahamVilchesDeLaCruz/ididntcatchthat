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
  SUBSCRIBERS,
  SubscribersBootstrapper,
} from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';
import { type Subscriber } from '@/shared/application/subscriber';

// Application — use cases
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { UpdateFlashcardStats } from '@/progress/application/update/update-flashcard-stats';
import { UpdateModuleProgress } from '@/progress/application/update/update-module-progress';
import { ImportGuestProgress } from '@/progress/application/import/import-guest-progress';

// Application — event subscribers
import { UpdateFlashcardStatsOnAttemptRecorded } from '@/progress/application/update/update-flashcard-stats-on-attempt-recorded';
import { UpdateModuleProgressOnGameCompleted } from '@/progress/application/update/update-module-progress-on-game-completed';
import { ImportGuestProgressOnGuestProgressMigrated } from '@/progress/application/import/import-guest-progress-on-guest-progress-migrated';

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
    UpdateFlashcardStats,
    UpdateModuleProgress,
    ImportGuestProgress,

    // Event subscribers
    UpdateFlashcardStatsOnAttemptRecorded,
    UpdateModuleProgressOnGameCompleted,
    ImportGuestProgressOnGuestProgressMigrated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        s1: UpdateFlashcardStatsOnAttemptRecorded,
        s2: UpdateModuleProgressOnGameCompleted,
        s3: ImportGuestProgressOnGuestProgressMigrated,
      ): Subscriber[] => [s1, s2, s3],
      inject: [
        UpdateFlashcardStatsOnAttemptRecorded,
        UpdateModuleProgressOnGameCompleted,
        ImportGuestProgressOnGuestProgressMigrated,
      ],
    },
    SubscribersBootstrapper,
  ],
})
export class ProgressModule {}
