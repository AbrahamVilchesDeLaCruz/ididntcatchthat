# Guest Auth — Diagrama de Clases

> Artefactos involucrados en `POST /auth/guest`

```mermaid
classDiagram
    class GuestAuthPostController {
        -useCase: GuestAuthenticator
        +handler(payload, req, res): Promise~void~
    }

    class GuestAuthenticator {
        -userSessionRepo: UserSessionRepository
        -tokenService: TokenService
        -logger: Logger
        +execute(params): Promise~GuestAuthenticatorResult~
    }

    class TokenService {
        <<interface>>
        +generateGuest(params): { accessToken, userSessionId }
        +generatePair(params): { accessToken, userSessionId }
        +verifyAccess(token): UserContext
    }

    class UserSession {
        +id: string
        +tokenId: string
        +userId: string | null
        +deviceId: string
        +expiresAt: Date
        +revokedAt: Date | null
        +createdAt: Date
        +create(id, tokenId, userId, deviceId)$ UserSession
        +isRevoked(): boolean
        +isExpired(): boolean
    }

    class UserSessionRepository {
        <<interface>>
        +match(criteria): Promise~UserSession[]~
        +save(token): Promise~void~
    }

    GuestAuthPostController --> GuestAuthenticator : invoca
    GuestAuthenticator --> TokenService : generateGuest
    GuestAuthenticator --> UserSession : crea instancia
    GuestAuthenticator --> UserSessionRepository : persiste
```
