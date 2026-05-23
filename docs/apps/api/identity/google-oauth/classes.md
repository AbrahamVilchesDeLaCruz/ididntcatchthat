# Google OAuth — Class Diagram

```mermaid
classDiagram
    class GoogleAuthGetController {
        +handler(): void
    }

    class GoogleCallbackAuthGetController {
        -oauthHandler: GoogleOAuthHandler
        +handler(ip, userAgent, acceptLanguage, res, profile): Promise~{ accessToken, isNewUser }~
    }

    class GoogleAuthGuard {
        +canActivate(context): boolean
    }

    class GoogleOAuthHandler {
        -userRepository: UserRepository
        -refreshTokenRepository: RefreshTokenRepository
        -tokenService: TokenService
        -publisher: DomainEventPublisher
        -nicknameResolver: NicknameResolverService
        +execute(params): Promise~GoogleOAuthHandlerResult~
    }

    class User {
        +id: UserId
        +email: Email
        +passwordHash: string | null
        +nickname: Nickname
        +avatarUrl: string | null
        +role: UserRole
        +oauthProvider: OauthProvider | null
        +register(params)$ User
        +withAvatar(url): User
        +pullDomainEvents(): DomainEvent[]
    }

    class NicknameResolverService {
        +resolve(displayName): Promise~string~
    }

    class UserRepository {
        <<interface>>
        +match(criteria): Promise~User[]~
        +save(user): Promise~void~
    }

    class RefreshTokenRepository {
        <<interface>>
        +save(token): Promise~void~
    }

    class TokenService {
        <<interface>>
        +generatePair(params): { accessToken, refreshTokenId }
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

    GoogleCallbackAuthGetController --> GoogleOAuthHandler
    GoogleCallbackAuthGetController ..> GoogleAuthGuard
    GoogleOAuthHandler --> UserRepository
    GoogleOAuthHandler --> RefreshTokenRepository
    GoogleOAuthHandler --> TokenService
    GoogleOAuthHandler --> DomainEventPublisher
    GoogleOAuthHandler --> NicknameResolverService
    GoogleOAuthHandler --> User
    User ..> UserRegisteredEvent
```
