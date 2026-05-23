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
        -refreshTokenRepository: RefreshTokenRepository
        -userRepository: UserRepository
        -tokenService: TokenService
        +execute(params): Promise~TokenRefresherResult~
    }

    class RefreshToken {
        +id: string
        +tokenId: string
        +userId: string | null
        +deviceId: string
        +expiresAt: Date
        +revokedAt: Date | null
        +createdAt: Date
        +isExpired(): boolean
        +isRevoked(): boolean
        +revoke(): RefreshToken
        +create(params)$ RefreshToken
        +fromPrimitives(p)$ RefreshToken
        +toPrimitives(): RefreshTokenPrimitives
    }

    class RefreshTokenRepository {
        <<interface>>
        +match(criteria): Promise~RefreshToken[]~
        +search(id): Promise~RefreshToken | null~
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
        +generatePair(params): { accessToken, refreshTokenId }
        +verifyAccess(token): UserContext
    }

    class Criteria {
        +filters: Filter[]
        +order: Order | null
        +pagination: Pagination | null
    }

    class InvalidRefreshTokenException
    class ExpiredRefreshTokenException
    class UserSessionCompromisedException
    class UserNotFoundException

    RefreshAuthPostController --> TokenRefresher
    TokenRefresher --> RefreshTokenRepository
    TokenRefresher --> UserRepository
    TokenRefresher --> TokenService
    TokenRefresher --> RefreshToken
    TokenRefresher --> Criteria
    TokenRefresher ..> InvalidRefreshTokenException
    TokenRefresher ..> ExpiredRefreshTokenException
    TokenRefresher ..> UserSessionCompromisedException
    TokenRefresher ..> UserNotFoundException
```
