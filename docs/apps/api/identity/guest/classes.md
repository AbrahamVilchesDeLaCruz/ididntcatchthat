# Guest Auth — Diagrama de Clases

> Artefactos involucrados en `POST /auth/guest`

```mermaid
classDiagram
    class GuestAuthPostController {
        -useCase: GuestAuthenticator
        +handler(payload, req, res): Promise~void~
    }

    class GuestAuthenticator {
        -refreshTokenRepo: RefreshTokenRepository
        -tokenService: TokenService
        -logger: Logger
        +execute(params): Promise~GuestAuthenticatorResult~
    }

    class TokenService {
        <<interface>>
        +generateGuest(params): { accessToken, refreshTokenId }
        +generatePair(params): { accessToken, refreshTokenId }
        +verifyAccess(token): UserContext
    }

    class RefreshToken {
        +id: string
        +tokenId: string
        +userId: string | null
        +deviceId: string
        +expiresAt: Date
        +revokedAt: Date | null
        +createdAt: Date
        +create(id, tokenId, userId, deviceId)$ RefreshToken
        +isRevoked(): boolean
        +isExpired(): boolean
    }

    class RefreshTokenRepository {
        <<interface>>
        +match(criteria): Promise~RefreshToken[]~
        +save(token): Promise~void~
    }

    GuestAuthPostController --> GuestAuthenticator : invoca
    GuestAuthenticator --> TokenService : generateGuest
    GuestAuthenticator --> RefreshToken : crea instancia
    GuestAuthenticator --> RefreshTokenRepository : persiste
```
