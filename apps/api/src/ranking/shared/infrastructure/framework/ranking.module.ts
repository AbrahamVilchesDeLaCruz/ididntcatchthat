import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RANKING_SCORE_REPOSITORY } from '@/ranking/projection/domain/ranking-score.repository';
import { RANKING_LEADERBOARD_QUERY } from '@/ranking/search/domain/ranking-leaderboard.query';
import { RANKING_PROFILE_QUERY } from '@/ranking/shared/domain/ranking-profile.query';
import { RANKING_USER_STATS_QUERY } from '@/ranking/projection/domain/ranking-user-stats.query';
import { RankingUserScoreEntity } from '@/ranking/projection/infrastructure/persistence/typeorm/ranking-user-score.entity';
import { TypeOrmRankingScoreRepository } from '@/ranking/projection/infrastructure/persistence/typeorm/typeorm-ranking-score.repository';
import { TypeOrmRankingLeaderboardQuery } from '@/ranking/search/infrastructure/persistence/typeorm/typeorm-ranking-leaderboard.query';
import { TypeOrmRankingUserStatsQuery } from '@/ranking/projection/infrastructure/persistence/typeorm/typeorm-ranking-user-stats.query';
import { IdentityRankingProfileAdapter } from '@/ranking/search/infrastructure/persistence/typeorm/identity-ranking-profile.adapter';
import { RankingSearcher } from '@/ranking/search/application/search/ranking-searcher';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { RecordRankingGameCompleted } from '@/ranking/projection/application/update/record-ranking-game-completed';
import { RecordRankingAttempt } from '@/ranking/projection/application/update/record-ranking-attempt';
import { RecordRankingStreakUpdated } from '@/ranking/projection/application/update/record-ranking-streak-updated';
import { RecordRankingModuleMastery } from '@/ranking/projection/application/update/record-ranking-module-mastery';
import { SyncRankingProfile } from '@/ranking/projection/application/update/sync-ranking-profile';
import { RankingUpdaterOnModuleMasteryLevelIncreased } from '@/ranking/projection/application/update/ranking-updater-on-module-mastery-level-increased';
import { RankingUpdaterOnGameCompleted } from '@/ranking/projection/application/update/ranking-updater-on-game-completed';
import { RankingUpdaterOnAttemptRecorded } from '@/ranking/projection/application/update/ranking-updater-on-attempt-recorded';
import { RankingUpdaterOnStreakUpdated } from '@/ranking/projection/application/update/ranking-updater-on-streak-updated';
import { RankingUpdaterOnRankingProfileUpdated } from '@/ranking/projection/application/update/ranking-updater-on-ranking-profile-updated';
import { RankingViewerProjector } from '@/ranking/search/domain/ranking-viewer-projector';
import { SearchRankingsGetController } from '@/ranking/search/infrastructure/controllers/search-rankings-get.controller';
import { RankingExceptionRegistry } from '@/ranking/shared/infrastructure/framework/ranking-exception-registry';
import { IdentityModule } from '@/identity/shared/infrastructure/framework/identity.module';
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
    IdentityModule,
    TypeOrmModule.forFeature([RankingUserScoreEntity]),
  ],
  controllers: [SearchRankingsGetController],
  providers: [
    {
      provide: RANKING_SCORE_REPOSITORY,
      useClass: TypeOrmRankingScoreRepository,
    },
    {
      provide: RANKING_LEADERBOARD_QUERY,
      useClass: TypeOrmRankingLeaderboardQuery,
    },
    {
      provide: RANKING_USER_STATS_QUERY,
      useClass: TypeOrmRankingUserStatsQuery,
    },
    {
      provide: RANKING_PROFILE_QUERY,
      useClass: IdentityRankingProfileAdapter,
    },
    RankingScoreWriter,
    RecordRankingGameCompleted,
    RecordRankingAttempt,
    RecordRankingStreakUpdated,
    RecordRankingModuleMastery,
    SyncRankingProfile,
    RankingSearcher,
    RankingViewerProjector,
    RankingUpdaterOnModuleMasteryLevelIncreased,
    RankingUpdaterOnGameCompleted,
    RankingUpdaterOnAttemptRecorded,
    RankingUpdaterOnStreakUpdated,
    RankingUpdaterOnRankingProfileUpdated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onMastery: RankingUpdaterOnModuleMasteryLevelIncreased,
        onGame: RankingUpdaterOnGameCompleted,
        onAttempt: RankingUpdaterOnAttemptRecorded,
        onStreak: RankingUpdaterOnStreakUpdated,
        onProfile: RankingUpdaterOnRankingProfileUpdated,
      ): Subscriber[] => [onMastery, onGame, onAttempt, onStreak, onProfile],
      inject: [
        RankingUpdaterOnModuleMasteryLevelIncreased,
        RankingUpdaterOnGameCompleted,
        RankingUpdaterOnAttemptRecorded,
        RankingUpdaterOnStreakUpdated,
        RankingUpdaterOnRankingProfileUpdated,
      ],
    },
    SubscribersBootstrapper,
    RankingExceptionRegistry,
  ],
})
export class RankingModule {}
