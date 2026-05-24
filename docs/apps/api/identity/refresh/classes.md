# Refresh — Class Diagram

Clases y dependencias involucradas en el flujo de renovación de token.

```mermaid
classDiagram
    class RefreshAuthPostController {
        -refresher: TokenRefresher
        +handler(req, res): Promise~{ accessToken }~
        -buildFingerprint(req): string
    }

    class TokenRefresher {
        -userSessionRepository: UserSessionRepository
        -userRepository: UserRepository
        -tokenService: TokenService
        +execute(params): Promise~TokenRefresherResult~
    }

    class UserSession {
        +id: string
        +tokenId: string
        +userId: string | null
        +deviceId: string
        +expiresAt: Date
        +revokedAt: Date | null
        +createdAt: Date
        +isExpired(): boolean
        +isRevoked(): boolean
        +revoke(): UserSession
        +create(id, tokenId, userId, deviceId)$ UserSession
        +fromPrimitives(p)$ UserSession
        +toPrimitives(): UserSessionPrimitives
    }

    class UserSessionRepository {
        <<interface>>
        +match(criteria): Promise~UserSession[]~
        +search(id): Promise~UserSession | null~
        +save(token): Promise~void~
        +remove(id): Promise~void~
    }

    class UserRepository {
        <<interface>>
        +search(id): Promise~User | null~
        +match(criteria): Promise~User[]~
        +save(user): Promise~void~
    }

    class TokenService {
        <<interface>>
        +generatePair(params): { accessToken, userSessionId }
        +verifyAccess(token): UserContext
    }

    class Criteria {
        +filters: Filter[]
        +order: Order | null
        +pagination: Pagination | null
    }

    class InvalidUserSessionException
    class ExpiredUserSessionException
    class UserSessionCompromisedException
    class UserNotFoundException

    RefreshAuthPostController --> TokenRefresher
    TokenRefresher --> UserSessionRepository
    TokenRefresher --> UserRepository
    TokenRefresher --> TokenService
    TokenRefresher --> UserSession
    TokenRefresher --> Criteria
    TokenRefresher ..> InvalidUserSessionException
    TokenRefresher ..> ExpiredUserSessionException
    TokenRefresher ..> UserSessionCompromisedException
    TokenRefresher ..> UserNotFoundException
```
