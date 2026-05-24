import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { USER_REPOSITORY } from '@/identity/domain/user.repository';
import { REFRESH_TOKEN_REPOSITORY } from '@/identity/domain/refresh-token.repository';
import { TOKEN_GENERATOR } from '@/identity/domain/token-generator';
import { PASSWORD_HASHER } from '@/identity/domain/password-hasher';
import { GUEST_GAME_MIGRATION_REPOSITORY } from '@/identity/domain/guest-game-migration.repository';
import { DOMAIN_EVENT_PUBLISHER } from '@/shared/domain/domain-event-publisher';

// Infrastructure — persistence
import { UserEntity } from '@/identity/infrastructure/persistence/user.entity';
import { RefreshTokenEntity } from '@/identity/infrastructure/persistence/refresh-token.entity';
import { TypeOrmUserRepository } from '@/identity/infrastructure/persistence/typeorm-user.repository';
import { TypeOrmRefreshTokenRepository } from '@/identity/infrastructure/persistence/typeorm-refresh-token.repository';
import { StubGuestGameMigrationRepository } from '@/identity/infrastructure/persistence/stub-guest-game-migration.repository';

// Infrastructure — services
import { JwtTokenGenerator } from './jwt-token-generator';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';

// Infrastructure — controllers
import { GuestAuthPostController } from '@/identity/infrastructure/controllers/guest-auth-post.controller';
import { RegisterAuthPostController } from '@/identity/infrastructure/controllers/register-auth-post.controller';
import { LoginAuthPostController } from '@/identity/infrastructure/controllers/login-auth-post.controller';
import { RefreshAuthPostController } from '@/identity/infrastructure/controllers/refresh-auth-post.controller';
import { LogoutAuthPostController } from '@/identity/infrastructure/controllers/logout-auth-post.controller';
import { GoogleAuthGetController } from '@/identity/infrastructure/controllers/google-auth-get.controller';
import { GoogleCallbackAuthGetController } from '@/identity/infrastructure/controllers/google-callback-auth-get.controller';
import { MigrateGuestAuthPostController } from '@/identity/infrastructure/controllers/migrate-guest-auth-post.controller';

// Infrastructure — exception registry
import { IdentityExceptionRegistry } from './identity-exception-registry';

// Application — use cases
import { GuestAuthenticator } from '@/identity/application/authenticate/guest-authenticator';
import { UserRegistrar } from '@/identity/application/register/user-registrar';
import { UserAuthenticator } from '@/identity/application/login/user-authenticator';
import { TokenRefresher } from '@/identity/application/refresh/token-refresher';
import { SessionRevoker } from '@/identity/application/logout/session-revoker';
import { OAuthAuthenticator } from '@/identity/application/authenticate/oauth-authenticator';
import { GuestProgressMigrator } from '@/identity/application/migrate-guest/guest-progress-migrator';

// Domain services
import { NicknameResolver } from '@/identity/domain/nickname-resolver';
import { UserSearcher } from '@/identity/domain/user-searcher';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';

// Domain event publisher stub (real implementation pending events infra)
import { NoopDomainEventPublisher } from './noop-domain-event-publisher';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
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
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: TypeOrmRefreshTokenRepository,
    },
    {
      provide: GUEST_GAME_MIGRATION_REPOSITORY,
      useClass: StubGuestGameMigrationRepository,
    },

    // Services
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },

    // Domain services
    NicknameResolver,
    UserSearcher,

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
