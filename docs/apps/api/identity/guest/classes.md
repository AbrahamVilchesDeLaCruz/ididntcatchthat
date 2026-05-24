# Guest Auth — Diagrama de Clases

> Artefactos involucrados en `POST /auth/guest`

```mermaid
classDiagram
    class GuestAuthPostController {
        -useCase: GuestAuthenticator
        +handler(payload, req, res): Promise~void~
    }

    class GuestAuthPostPayload {
        +guestDeviceId?: string
    }

    class GuestAuthenticator {
        -sessionRepository: UserSessionRepository
        -tokenGenerator: TokenGenerator
        -logger: Logger
        +execute(params): Promise~GuestAuthenticatorResult~
    }

    class TokenGenerator {
        <<interface>>
        +generateGuest(context): TokenPair
        +generatePair(context): TokenPair
    }

    class UserSession {
        +id: string
        +tokenId: string
        +ownerId: string
        +ownerType: guest
        +deviceId: string
        +fingerprint: string
        +expiresAt: Date
        +revokedAt: Date | null
        +createdAt: Date
        +createGuest(id, tokenId, deviceId, fingerprint)$ UserSession
        +isRevoked(): boolean
        +isExpired(): boolean
        +isGuest(): boolean
    }

    class UserSessionRepository {
        <<interface>>
        +match(criteria): Promise~UserSession[]~
        +search(id): Promise~UserSession | null~
        +save(session): Promise~void~
        +remove(id): Promise~void~
    }

    class SessionStartedEvent {
        +eventName: string
        +sessionId: string
        +ownerId: string
        +ownerType: string
        +deviceId: string
    }

    GuestAuthPostController --> GuestAuthPostPayload : valida
    GuestAuthPostController --> GuestAuthenticator : invoca
    GuestAuthenticator --> TokenGenerator : generateGuest
    GuestAuthenticator --> UserSession : crea via createGuest()
    GuestAuthenticator --> UserSessionRepository : persiste
    UserSession ..> SessionStartedEvent : emite
```
