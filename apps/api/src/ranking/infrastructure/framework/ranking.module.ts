import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RANKING_REPOSITORY } from '@/ranking/domain/ranking.repository';
import { RANKING_SELECTOR } from '@/ranking/domain/ranking-selector';
import { RANKING_USER_READER } from '@/ranking/domain/ranking-user.reader';
import { RANKING_USER_STATS_QUERY } from '@/ranking/domain/ranking-user-stats.query';
import { RankingUserScoreEntity } from '@/ranking/infrastructure/persistence/typeorm/ranking-user-score.entity';
import { TypeOrmRankingRepository } from '@/ranking/infrastructure/persistence/typeorm/typeorm-ranking.repository';
import { TypeOrmRankingSelector } from '@/ranking/infrastructure/selectors/typeorm-ranking.selector';
import { TypeOrmRankingUserStatsQuery } from '@/ranking/infrastructure/persistence/typeorm/typeorm-ranking-user-stats.query';
import { TypeOrmRankingUserReader } from '@/ranking/infrastructure/persistence/typeorm/typeorm-ranking-user.reader';
import { RankingFinder } from '@/ranking/application/find/ranking-finder';
import { RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { UpdateRankingOnModuleMasteryLevelIncreased } from '@/ranking/application/handlers/update-ranking-on-module-mastery-level-increased';
import { UpdateRankingOnGameCompleted } from '@/ranking/application/handlers/update-ranking-on-game-completed';
import { UpdateRankingOnAttemptRecorded } from '@/ranking/application/handlers/update-ranking-on-attempt-recorded';
import { UpdateRankingOnStreakUpdated } from '@/ranking/application/handlers/update-ranking-on-streak-updated';
import { SearchRankingsGetController } from '@/ranking/infrastructure/controllers/search-rankings-get.controller';
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
    TypeOrmModule.forFeature([RankingUserScoreEntity]),
  ],
  controllers: [SearchRankingsGetController],
  providers: [
    {
      provide: RANKING_REPOSITORY,
      useClass: TypeOrmRankingRepository,
    },
    {
      provide: RANKING_SELECTOR,
      useClass: TypeOrmRankingSelector,
    },
    {
      provide: RANKING_USER_STATS_QUERY,
      useClass: TypeOrmRankingUserStatsQuery,
    },
    {
      provide: RANKING_USER_READER,
      useClass: TypeOrmRankingUserReader,
    },
    RankingUpdater,
    RankingFinder,
    UpdateRankingOnModuleMasteryLevelIncreased,
    UpdateRankingOnGameCompleted,
    UpdateRankingOnAttemptRecorded,
    UpdateRankingOnStreakUpdated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onMastery: UpdateRankingOnModuleMasteryLevelIncreased,
        onGame: UpdateRankingOnGameCompleted,
        onAttempt: UpdateRankingOnAttemptRecorded,
        onStreak: UpdateRankingOnStreakUpdated,
      ): Subscriber[] => [onMastery, onGame, onAttempt, onStreak],
      inject: [
        UpdateRankingOnModuleMasteryLevelIncreased,
        UpdateRankingOnGameCompleted,
        UpdateRankingOnAttemptRecorded,
        UpdateRankingOnStreakUpdated,
      ],
    },
    SubscribersBootstrapper,
  ],
  exports: [RankingUpdater],
})
export class RankingModule {}
