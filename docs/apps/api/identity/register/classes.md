# Register — Diagrama de Clases

> Artefactos involucrados en `POST /auth/register`

```mermaid
classDiagram
    class RegisterAuthPostController {
        -useCase: UserRegistrar
        +handler(payload, res): Promise~void~
    }

    class RegisterAuthPostPayload {
        +email: string
        +password: string
        +nickname: string
        +guestDeviceId?: string
    }

    class UserRegistrar {
        -userRepo: UserRepository
        -userSessionRepo: UserSessionRepository
        -passwordHasher: PasswordHasher
        -tokenGenerator: TokenGenerator
        -publisher: DomainEventPublisher
        +execute(req): Promise~UserRegistrarResult~
    }

    class User {
        +id: UserId
        +email: Email
        +passwordHash: PasswordHash | null
        +nickname: Nickname
        +role: UserRole
        +register(...)$ User
        +fromPrimitives(p)$ User
        +toPrimitives(): UserPrimitives
        +pullEvents(): DomainEvent[]
    }

    class UserRegisteredEvent {
        +eventName: string
        +userId: string
        +email: string
        +nickname: string
        +occurredOn: Date
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
    UserRegistrar --> DomainEventPublisher : publica eventos
    UserRegistrar --> UserRepository : verifica unicidad + save
    UserRegistrar --> UserSessionRepository : persiste token
```
