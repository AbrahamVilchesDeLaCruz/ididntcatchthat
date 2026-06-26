import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { USER_FLASHCARD_STATS_REPOSITORY } from '@/progress/domain/user-flashcard-stats.repository';
import { MODULE_PROGRESS_REPOSITORY } from '@/progress/domain/module-progress.repository';
import { PROCESSED_EVENTS_REPOSITORY } from '@/shared/domain/processed-events.repository';
import { GUEST_ATTEMPT_REPOSITORY } from '@/progress/domain/guest-attempt.repository';
import { WEAKEST_FLASHCARD_QUERY } from '@/progress/domain/weakest-flashcard.query';
import { SUBCATEGORY_PROGRESS_QUERY } from '@/progress/domain/subcategory-progress.query';

// Infrastructure — entities
import { UserFlashcardStatsEntity } from '@/progress/infrastructure/persistence/typeorm/user-flashcard-stats.entity';
import { ModuleProgressEntity } from '@/progress/infrastructure/persistence/typeorm/module-progress.entity';
import { ProcessedEventEntity } from '@/shared/infrastructure/persistence/inbox/processed-event.entity';

// Infrastructure — repositories
import { TypeOrmUserFlashcardStatsRepository } from '@/progress/infrastructure/persistence/typeorm/typeorm-user-flashcard-stats.repository';
import { TypeOrmModuleProgressRepository } from '@/progress/infrastructure/persistence/typeorm/typeorm-module-progress.repository';
import { TypeOrmProcessedEventsRepository } from '@/shared/infrastructure/persistence/inbox/typeorm-processed-events.repository';
import { TypeOrmGuestAttemptRepository } from '@/progress/infrastructure/persistence/typeorm/typeorm-guest-attempt.repository';
import { TypeOrmWeakestFlashcardQuery } from '@/progress/infrastructure/persistence/typeorm/typeorm-weakest-flashcard.query';
import { TypeOrmSubcategoryProgressQuery } from '@/progress/infrastructure/persistence/typeorm/typeorm-subcategory-progress.query';
// Infrastructure — controllers
import { SearchModulesProgressGetController } from '@/progress/infrastructure/controllers/search-modules-progress-get.controller';
import { GetWeakestFlashcardsGetController } from '@/progress/infrastructure/controllers/get-weakest-flashcards-get.controller';
import { GetSubcategoriesProgressGetController } from '@/progress/infrastructure/controllers/get-subcategories-progress-get.controller';

// Infrastructure — event bus
import {
  SUBSCRIBERS,
  SubscribersBootstrapper,
} from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';
import { type Subscriber } from '@/shared/application/subscriber';

// Application — use cases
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { SubcategoryProgressFinder } from '@/progress/application/find/subcategory-progress-finder';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { FlashcardStatsUpdater } from '@/progress/application/update/flashcard-stats-updater';
import { ModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { GuestProgressImporter } from '@/progress/application/import/guest-progress-importer';

// Application — event subscribers
import { FlashcardStatsUpdaterOnAttemptRecorded } from '@/progress/application/update/update-flashcard-stats-on-attempt-recorded';
import { ModuleProgressUpdaterOnGameCompleted } from '@/progress/application/update/update-module-progress-on-game-completed';
import { GuestProgressImporterOnGuestProgressMigrated } from '@/progress/application/import/import-guest-progress-on-guest-progress-migrated';

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
    SearchModulesProgressGetController,
    GetWeakestFlashcardsGetController,
    GetSubcategoriesProgressGetController,
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
    {
      provide: WEAKEST_FLASHCARD_QUERY,
      useClass: TypeOrmWeakestFlashcardQuery,
    },
    {
      provide: SUBCATEGORY_PROGRESS_QUERY,
      useClass: TypeOrmSubcategoryProgressQuery,
    },

    // Use cases
    ModuleProgressFinder,
    SubcategoryProgressFinder,
    WeakestFlashcardSearcher,
    FlashcardStatsUpdater,
    ModuleProgressUpdater,
    GuestProgressImporter,

    // Event subscribers
    FlashcardStatsUpdaterOnAttemptRecorded,
    ModuleProgressUpdaterOnGameCompleted,
    GuestProgressImporterOnGuestProgressMigrated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        s1: FlashcardStatsUpdaterOnAttemptRecorded,
        s2: ModuleProgressUpdaterOnGameCompleted,
        s3: GuestProgressImporterOnGuestProgressMigrated,
      ): Subscriber[] => [s1, s2, s3],
      inject: [
        FlashcardStatsUpdaterOnAttemptRecorded,
        ModuleProgressUpdaterOnGameCompleted,
        GuestProgressImporterOnGuestProgressMigrated,
      ],
    },
    SubscribersBootstrapper,
  ],
})
export class ProgressModule {}
