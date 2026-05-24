# Google OAuth — Class Diagram

```mermaid
classDiagram
    class GoogleAuthGetController {
        +handler(): void
    }

    class GoogleCallbackAuthGetController {
        -authenticator: OAuthAuthenticator
        +handler(ip, userAgent, acceptLanguage, res, profile): Promise~{ accessToken }~
    }

    class GoogleAuthGuard {
        +canActivate(context): boolean
    }

    class OAuthAuthenticator {
        -userRepository: UserRepository
        -userSessionRepository: UserSessionRepository
        -tokenService: TokenService
        -publisher: DomainEventPublisher
        -nicknameResolver: NicknameResolverService
        -logger: Logger
        -searcher: UserSearcher
        +execute(id, email, avatarUrl, displayName, deviceId, fingerprint, ip): Promise~OAuthAuthenticationResponse~
    }

    class UserSearcher {
        -repository: UserRepository
        +search(email): Promise~User | null~
    }

    class User {
        +id: UserId
        +email: Email
        +passwordHash: PasswordHash | null
        +nickname: Nickname
        +avatarUrl: string | null
        +role: UserRole
        +oauthProvider: OauthProvider | null
        +register(id, email, passwordHash, nickname, avatarUrl, role, oauthProvider)$ User
        +fromPrimitives(p)$ User
        +addAvatar(url): User
        +pullDomainEvents(): DomainEvent[]
    }

    class NicknameResolverService {
        +resolve(displayName): Promise~string~
    }

    class UserRepository {
        <<interface>>
        +match(criteria): Promise~User[]~
        +search(id): Promise~User | null~
        +save(user): Promise~void~
    }

    class UserSessionRepository {
        <<interface>>
        +save(token): Promise~void~
    }

    class TokenService {
        <<interface>>
        +generatePair(params): { accessToken, userSessionId }
    }

    class DomainEventPublisher {
        <<interface>>
        +publish(events): Promise~void~
    }

    class UserRegisteredEvent {
        +userId: string
        +email: string
        +nickname: string
    }

    GoogleCallbackAuthGetController --> OAuthAuthenticator
    GoogleCallbackAuthGetController ..> GoogleAuthGuard
    OAuthAuthenticator --> UserSearcher
    OAuthAuthenticator --> UserRepository
    OAuthAuthenticator --> UserSessionRepository
    OAuthAuthenticator --> TokenService
    OAuthAuthenticator --> DomainEventPublisher
    OAuthAuthenticator --> NicknameResolverService
    OAuthAuthenticator --> User
    UserSearcher --> UserRepository
    User ..> UserRegisteredEvent
```
