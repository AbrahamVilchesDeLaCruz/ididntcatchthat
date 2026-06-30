import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { GAME_COMPLETED_CONDITION_STRATEGIES } from '@/achievement/catalog/domain/unlock/game-completed-condition-strategy';
import { allGameCompletedConditionStrategies } from '@/achievement/catalog/domain/unlock/game-completed-condition-strategies';
import { GameCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/game-completed-achievement-unlock-policy';
import { STUDY_COMPLETED_CONDITION_STRATEGIES } from '@/achievement/catalog/domain/unlock/study-completed-condition-strategy';
import { allStudyCompletedConditionStrategies } from '@/achievement/catalog/domain/unlock/study-completed-condition-strategies';
import { StudyCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/study-completed-achievement-unlock-policy';
import { StreakAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/streak-achievement-unlock-policy';
import { ModuleMasteryAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/module-mastery-achievement-unlock-policy';
import { USER_ACHIEVEMENT_REPOSITORY } from '@/achievement/user-achievement/domain/user-achievement.repository';
import { USER_ACHIEVEMENT_PROGRESS_REPOSITORY } from '@/achievement/progress/domain/user-achievement-progress.repository';
import { UserAchievementEntity } from '@/achievement/user-achievement/infrastructure/persistence/user-achievement.entity';
import { UserAchievementProgressEntity } from '@/achievement/progress/infrastructure/persistence/user-achievement-progress.entity';
import { TypeOrmUserAchievementRepository } from '@/achievement/user-achievement/infrastructure/persistence/typeorm-user-achievement.repository';
import { TypeOrmUserAchievementProgressRepository } from '@/achievement/progress/infrastructure/persistence/typeorm-user-achievement-progress.repository';
import { UserAchievementUnlocker } from '@/achievement/user-achievement/domain/user-achievement-unlocker';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';
import { GameCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/game-completed-achievement-unlocker';
import { StudyCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/study-completed-achievement-unlocker';
import { StreakAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/streak-achievement-unlocker';
import { ModuleMasteryAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/module-mastery-achievement-unlocker';
import { AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { UpdateAchievementProgressOnAttemptRecorded } from '@/achievement/progress/application/update/update-achievement-progress-on-attempt-recorded';
import { UpdateAchievementProgressOnFlashcardViewed } from '@/achievement/progress/application/update/update-achievement-progress-on-flashcard-viewed';
import { AchievementsSearcher } from '@/achievement/user-achievement/application/search/achievements-searcher';
import { UserAchievementViewProjector } from '@/achievement/user-achievement/domain/user-achievement-view-projector';
import { UnlockUserAchievementOnGameCompleted } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-game-completed';
import { UnlockUserAchievementOnStreakUpdated } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-streak-updated';
import { UnlockUserAchievementOnModuleMasteryLevelIncreased } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-module-mastery-level-increased';
import { SearchAchievementsGetController } from '@/achievement/user-achievement/infrastructure/controllers/search-achievements-get.controller';
import { AchievementExceptionRegistry } from '@/achievement/shared/infrastructure/framework/achievement-exception-registry';
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import {
  SUBSCRIBERS,
  SubscribersBootstrapper,
} from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';
import { type Subscriber } from '@/shared/application/subscriber';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      UserAchievementEntity,
      UserAchievementProgressEntity,
    ]),
  ],
  controllers: [SearchAchievementsGetController],
  providers: [
    AchievementCatalog,
    {
      provide: GAME_COMPLETED_CONDITION_STRATEGIES,
      useFactory: allGameCompletedConditionStrategies,
    },
    GameCompletedAchievementUnlockPolicy,
    {
      provide: STUDY_COMPLETED_CONDITION_STRATEGIES,
      useFactory: allStudyCompletedConditionStrategies,
    },
    StudyCompletedAchievementUnlockPolicy,
    StreakAchievementUnlockPolicy,
    ModuleMasteryAchievementUnlockPolicy,
    {
      provide: USER_ACHIEVEMENT_REPOSITORY,
      useClass: TypeOrmUserAchievementRepository,
    },
    {
      provide: USER_ACHIEVEMENT_PROGRESS_REPOSITORY,
      useClass: TypeOrmUserAchievementProgressRepository,
    },
    AchievementProgressUpdater,
    UserAchievementUnlocker,
    CatalogRuleAchievementUnlocker,
    GameCompletedAchievementUnlocker,
    StudyCompletedAchievementUnlocker,
    StreakAchievementUnlocker,
    ModuleMasteryAchievementUnlocker,
    UserAchievementViewProjector,
    AchievementsSearcher,
    UnlockUserAchievementOnGameCompleted,
    UnlockUserAchievementOnStreakUpdated,
    UnlockUserAchievementOnModuleMasteryLevelIncreased,
    UpdateAchievementProgressOnAttemptRecorded,
    UpdateAchievementProgressOnFlashcardViewed,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onGame: UnlockUserAchievementOnGameCompleted,
        onStreak: UnlockUserAchievementOnStreakUpdated,
        onMastery: UnlockUserAchievementOnModuleMasteryLevelIncreased,
        onAttempt: UpdateAchievementProgressOnAttemptRecorded,
        onView: UpdateAchievementProgressOnFlashcardViewed,
      ): Subscriber[] => [onGame, onStreak, onMastery, onAttempt, onView],
      inject: [
        UnlockUserAchievementOnGameCompleted,
        UnlockUserAchievementOnStreakUpdated,
        UnlockUserAchievementOnModuleMasteryLevelIncreased,
        UpdateAchievementProgressOnAttemptRecorded,
        UpdateAchievementProgressOnFlashcardViewed,
      ],
    },
    SubscribersBootstrapper,
    AchievementExceptionRegistry,
  ],
  exports: [AchievementCatalog, USER_ACHIEVEMENT_REPOSITORY],
})
export class AchievementModule {}
