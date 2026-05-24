# Register — Diagrama de Clases

> Artefactos involucrados en `POST /auth/register`

```mermaid
classDiagram
    class RegisterAuthPostController {
        -useCase: UserRegistrar
        +handler(payload, req, res): Promise~void~
    }

    class RegisterAuthPostPayload {
        +email: string
        +password: string
        +nickname: string
        +guestDeviceId?: string
    }

    class UserRegistrar {
        -userRepo: UserRepository
        -sessionRepository: UserSessionRepository
        -passwordHasher: PasswordHasher
        -tokenGenerator: TokenGenerator
        -publisher: DomainEventPublisher
        +execute(params): Promise~UserRegistrarResult~
    }

    class User {
        +id: UserId
        +email: Email
        +passwordHash: PasswordHash | null
        +nickname: Nickname
        +role: UserRole
        +register(id, email, hash, nickname, avatarUrl, role, oauthProvider)$ User
        +fromPrimitives(p)$ User
        +toPrimitives(): UserPrimitives
        +pullEvents(): DomainEvent[]
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
    }

    class UserRegisteredEvent {
        +eventName: string
        +userId: string
        +email: string
        +nickname: string
        +occurredOn: Date
    }

    class TokenGenerator {
        <<interface>>
        +generatePair(context): TokenPair
        +generateGuest(context): TokenPair
    }

    class PasswordHasher {
        <<interface>>
        +hash(plain, cost): Promise~string~
        +compare(plain, hash): Promise~boolean~
    }

    class DomainEventPublisher {
        <<interface>>
        +publish(events): Promise~void~
    }

    RegisterAuthPostController --> RegisterAuthPostPayload : valida
    RegisterAuthPostController --> UserRegistrar : invoca
    UserRegistrar --> User : crea via register()
    UserRegistrar --> UserRegisteredEvent : emite via User
    UserRegistrar --> PasswordHasher : hashea password
    UserRegistrar --> TokenGenerator : generatePair
    UserRegistrar --> DomainEventPublisher : publica eventos
    UserRegistrar --> UserRepository : verifica unicidad + save
    UserRegistrar --> UserSession : crea via create()
    UserRegistrar --> UserSessionRepository : persiste sesión
```
