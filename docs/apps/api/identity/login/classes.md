# Login — Diagrama de Clases

> Artefactos involucrados en `POST /auth/login`

```mermaid
classDiagram
    class LoginAuthPostController {
        -authenticator: UserAuthenticator
        +handler(payload, req, res): Promise~void~
    }

    class LoginAuthPostPayload {
        +email: string
        +password: string
        +guestDeviceId?: string
    }

    class UserAuthenticator {
        -userRepo: UserRepository
        -sessionRepository: UserSessionRepository
        -passwordHasher: PasswordHasher
        -tokenGenerator: TokenGenerator
        -publisher: DomainEventPublisher
        +execute(params): Promise~UserAuthenticatorResult~
    }

    class User {
        +id: UserId
        +email: Email
        +passwordHash: PasswordHash | null
        +nickname: Nickname
        +role: UserRole
        +fromPrimitives(p)$ User
        +toPrimitives(): UserPrimitives
    }

    class UserSession {
        +id: string
        +tokenId: string
        +ownerId: string
        +ownerType: user
        +deviceId: string
        +fingerprint: string
        +expiresAt: Date
        +revokedAt: Date | null
        +createdAt: Date
        +create(id, tokenId, ownerId, deviceId, fingerprint)$ UserSession
        +isRevoked(): boolean
        +isExpired(): boolean
    }

    class TokenGenerator {
        <<interface>>
        +generatePair(context): TokenPair
        +generateGuest(context): TokenPair
    }

    class PasswordHasher {
        <<interface>>
        +compare(plain, hash): Promise~boolean~
    }

    class DomainEventPublisher {
        <<interface>>
        +publish(events): Promise~void~
    }

    class InvalidCredentials {
        +message: string
        +statusCode: 401
    }

    LoginAuthPostController --> LoginAuthPostPayload : valida
    LoginAuthPostController --> UserAuthenticator : invoca
    UserAuthenticator --> UserRepository : busca por email
    UserAuthenticator --> PasswordHasher : compara hash
    UserAuthenticator --> UserSession : crea via create()
    UserAuthenticator --> UserSessionRepository : persiste sesión
    UserAuthenticator --> TokenGenerator : generatePair
    UserAuthenticator --> DomainEventPublisher : publica eventos
    UserAuthenticator ..> InvalidCredentials : lanza si credenciales inválidas
```
