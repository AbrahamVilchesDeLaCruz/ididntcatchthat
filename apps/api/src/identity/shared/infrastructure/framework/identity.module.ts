import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { USER_REPOSITORY } from '@/identity/user/domain/user.repository';
import { USER_SESSION_REPOSITORY } from '@/identity/session/domain/user-session.repository';
import { TOKEN_GENERATOR } from '@/identity/shared/domain/token-generator';
import { PASSWORD_HASHER } from '@/identity/user/domain/password-hasher';
import { UserEntity } from '@/identity/user/infrastructure/persistence/user.entity';
import { UserSessionEntity } from '@/identity/session/infrastructure/persistence/user-session.entity';
import { TypeOrmUserRepository } from '@/identity/user/infrastructure/persistence/typeorm-user.repository';
import { TypeOrmUserSessionRepository } from '@/identity/session/infrastructure/persistence/typeorm-user-session.repository';
// Infrastructure — persistence
import { JwtTokenGenerator } from './jwt-token-generator';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';

// Infrastructure — shared
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';

// Infrastructure — controllers
import { GuestAuthPostController } from '@/identity/session/infrastructure/controllers/guest-auth-post.controller';
import { RegisterAuthPostController } from '@/identity/user/infrastructure/controllers/register-auth-post.controller';
import { LoginAuthPostController } from '@/identity/user/infrastructure/controllers/login-auth-post.controller';
import { RefreshAuthPostController } from '@/identity/session/infrastructure/controllers/refresh-auth-post.controller';
import { LogoutAuthPostController } from '@/identity/session/infrastructure/controllers/logout-auth-post.controller';
import { GoogleAuthGetController } from '@/identity/user/infrastructure/controllers/google-auth-get.controller';
import { GoogleCallbackAuthGetController } from '@/identity/user/infrastructure/controllers/google-callback-auth-get.controller';
import { MigrateGuestAuthPostController } from '@/identity/user/infrastructure/controllers/migrate-guest-auth-post.controller';
import { UpdateRankingProfilePatchController } from '@/identity/user/infrastructure/controllers/update-ranking-profile-patch.controller';
import { FindRankingProfileGetController } from '@/identity/user/infrastructure/controllers/find-ranking-profile-get.controller';
import { SearchUserStatsGetController } from '@/identity/user/infrastructure/controllers/search-user-stats-get.controller';

// Infrastructure — exception registry
import { IdentityExceptionRegistry } from './identity-exception-registry';

// Application — use cases
import { GuestAuthenticator } from '@/identity/session/application/authenticate/guest-authenticator';
import { UserRegistrar } from '@/identity/user/application/register/user-registrar';
import { UserAuthenticator } from '@/identity/user/application/login/user-authenticator';
import { TokenRefresher } from '@/identity/session/application/refresh/token-refresher';
import { SessionRevoker } from '@/identity/session/application/logout/session-revoker';
import { OAuthAuthenticator } from '@/identity/user/application/authenticate/oauth-authenticator';
import { GuestProgressMigrator } from '@/identity/user/application/migrate-guest/guest-progress-migrator';
import { StreakUpdater } from '@/identity/user/application/update-streak/streak-updater';
import { StreakUpdaterOnGameCompleted } from '@/identity/user/application/update-streak/update-streak-on-game-completed';
import { StreakUpdaterOnFlashcardViewed } from '@/identity/user/application/update-streak/update-streak-on-flashcard-viewed';
import { StreakBrokenCronJob } from '@/identity/user/application/update-streak/streak-broken-cron.job';
import { RankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';
import { RankingProfileFinder } from '@/identity/user/application/update-profile/ranking-profile-finder';
import { UserStatsRetriever } from '@/identity/user/application/stats/user-stats-retriever';
import { USER_STATS_QUERY } from '@/identity/user/application/stats/user-stats.query';
import { TypeOrmUserStatsQuery } from '@/identity/user/infrastructure/persistence/typeorm-user-stats.query';
import { USER_STREAK_QUERY } from '@/identity/user/domain/user-streak.query';
import { TypeOrmUserStreakQuery } from '@/identity/user/infrastructure/persistence/typeorm-user-streak.query';
import { RANKING_ELIGIBILITY_QUERY } from '@/identity/user/domain/ranking-eligibility.query';
import { TypeOrmRankingEligibilityQuery } from '@/identity/user/infrastructure/persistence/typeorm-ranking-eligibility.query';
import {
  SUBSCRIBERS,
  SubscribersBootstrapper,
} from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';
import { type Subscriber } from '@/shared/application/subscriber';

// Domain services
import { NicknameResolver } from '@/identity/user/domain/nickname-resolver';
import { UserSearcher } from '@/identity/user/domain/user-searcher';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { GamingModule } from '@/gaming/infrastructure/framework/gaming.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    GamingModule,
    TypeOrmModule.forFeature([UserEntity, UserSessionEntity]),
  ],
  controllers: [
    GuestAuthPostController,
    RegisterAuthPostController,
    LoginAuthPostController,
    RefreshAuthPostController,
    LogoutAuthPostController,
    GoogleAuthGetController,
    GoogleCallbackAuthGetController,
    MigrateGuestAuthPostController,
    FindRankingProfileGetController,
    UpdateRankingProfilePatchController,
    SearchUserStatsGetController,
  ],
  providers: [
    // Repositories
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    {
      provide: USER_SESSION_REPOSITORY,
      useClass: TypeOrmUserSessionRepository,
    },

    // Services
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },

    // Domain services
    NicknameResolver,
    UserSearcher,

    // Infrastructure services
    FingerprintBuilder,

    // Use cases
    GuestAuthenticator,
    UserRegistrar,
    UserAuthenticator,
    TokenRefresher,
    SessionRevoker,
    OAuthAuthenticator,
    GuestProgressMigrator,
    StreakUpdater,
    StreakUpdaterOnGameCompleted,
    StreakUpdaterOnFlashcardViewed,
    StreakBrokenCronJob,
    RankingProfileUpdater,
    RankingProfileFinder,
    // User stats
    { provide: USER_STATS_QUERY, useClass: TypeOrmUserStatsQuery },
    { provide: USER_STREAK_QUERY, useClass: TypeOrmUserStreakQuery },
    {
      provide: RANKING_ELIGIBILITY_QUERY,
      useClass: TypeOrmRankingEligibilityQuery,
    },
    UserStatsRetriever,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        onGameCompleted: StreakUpdaterOnGameCompleted,
        onFlashcardViewed: StreakUpdaterOnFlashcardViewed,
      ): Subscriber[] => [onGameCompleted, onFlashcardViewed],
      inject: [StreakUpdaterOnGameCompleted, StreakUpdaterOnFlashcardViewed],
    },
    SubscribersBootstrapper,

    // Exception registry
    IdentityExceptionRegistry,
  ],
  exports: [USER_STREAK_QUERY, RANKING_ELIGIBILITY_QUERY],
})
export class IdentityModule {}
