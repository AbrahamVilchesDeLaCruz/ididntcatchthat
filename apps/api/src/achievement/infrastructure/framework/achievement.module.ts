import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_ACHIEVEMENT_REPOSITORY } from '@/achievement/domain/user-achievement.repository';
import { TOTAL_ATTEMPTS_QUERY } from '@/achievement/domain/total-attempts.query';
import { UserAchievementEntity } from '@/achievement/infrastructure/persistence/typeorm/user-achievement.entity';
import { TypeOrmUserAchievementRepository } from '@/achievement/infrastructure/persistence/typeorm/typeorm-user-achievement.repository';
import { TypeOrmTotalAttemptsQuery } from '@/achievement/infrastructure/persistence/typeorm/typeorm-total-attempts.query';
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import { AchievementGameCompletedEvaluator } from '@/achievement/application/unlock/achievement-game-completed-evaluator';
import { AchievementsFinder } from '@/achievement/application/find/achievements-finder';
import { UnlockAchievementOnGameCompleted } from '@/achievement/application/handlers/unlock-achievement-on-game-completed';
import { UnlockAchievementOnStreakUpdated } from '@/achievement/application/handlers/unlock-achievement-on-streak-updated';
import { UnlockAchievementOnModuleMasteryLevelIncreased } from '@/achievement/application/handlers/unlock-achievement-on-module-mastery-level-increased';
import { GetAchievementsGetController } from '@/achievement/infrastructure/controllers/get-achievements-get.controller';
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
    TypeOrmModule.forFeature([UserAchievementEntity]),
  ],
  controllers: [GetAchievementsGetController],
  providers: [
    {
      provide: USER_ACHIEVEMENT_REPOSITORY,
      useClass: TypeOrmUserAchievementRepository,
    },
    {
      provide: TOTAL_ATTEMPTS_QUERY,
      useClass: TypeOrmTotalAttemptsQuery,
    },
    AchievementUnlocker,
    AchievementGameCompletedEvaluator,
    AchievementsFinder,
    UnlockAchievementOnGameCompleted,
    UnlockAchievementOnStreakUpdated,
    UnlockAchievementOnModuleMasteryLevelIncreased,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onGame: UnlockAchievementOnGameCompleted,
        onStreak: UnlockAchievementOnStreakUpdated,
        onMastery: UnlockAchievementOnModuleMasteryLevelIncreased,
      ): Subscriber[] => [onGame, onStreak, onMastery],
      inject: [
        UnlockAchievementOnGameCompleted,
        UnlockAchievementOnStreakUpdated,
        UnlockAchievementOnModuleMasteryLevelIncreased,
      ],
    },
    SubscribersBootstrapper,
  ],
})
export class AchievementModule {}
