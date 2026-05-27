import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { USER_REPOSITORY } from '@/identity/user/domain/user.repository';
import { USER_SESSION_REPOSITORY } from '@/identity/session/domain/user-session.repository';
import { TOKEN_GENERATOR } from '@/identity/shared/domain/token-generator';
import { PASSWORD_HASHER } from '@/identity/user/domain/password-hasher';
import { GUEST_GAME_MIGRATION_REPOSITORY } from '@/identity/user/domain/guest-game-migration.repository';
// Infrastructure — persistence
import { UserEntity } from '@/identity/user/infrastructure/persistence/user.entity';
import { UserSessionEntity } from '@/identity/session/infrastructure/persistence/user-session.entity';
import { TypeOrmUserRepository } from '@/identity/user/infrastructure/persistence/typeorm-user.repository';
import { TypeOrmUserSessionRepository } from '@/identity/session/infrastructure/persistence/typeorm-user-session.repository';
import { StubGuestGameMigrationRepository } from '@/identity/shared/infrastructure/persistence/stub-guest-game-migration.repository';

// Infrastructure — services
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

// Domain services
import { NicknameResolver } from '@/identity/user/domain/nickname-resolver';
import { UserSearcher } from '@/identity/user/domain/user-searcher';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
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
  ],
  providers: [
    // Repositories
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    {
      provide: USER_SESSION_REPOSITORY,
      useClass: TypeOrmUserSessionRepository,
    },
    {
      provide: GUEST_GAME_MIGRATION_REPOSITORY,
      useClass: StubGuestGameMigrationRepository,
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

    // Exception registry
    IdentityExceptionRegistry,
  ],
})
export class IdentityModule {}
