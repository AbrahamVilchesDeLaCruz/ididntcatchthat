# Register — Diagrama de Secuencia

> `POST /auth/register` — controller → use case → domain → persistence

## Flujo exitoso

```mermaid
sequenceDiagram
    actor Client
    participant C as RegisterAuthPostController
    participant UC as UserRegisterer
    participant PS as PasswordService
    participant U as User
    participant UREPO as UserRepository
    participant RTREPO as RefreshTokenRepository
    participant PUB as DomainEventPublisher

    Client->>C: POST /auth/register { email, password, nickname }

    C->>UC: execute({ email, password, nickname, deviceId, fingerprint, ip })

    UC->>UREPO: match(criteria { email })
    UREPO-->>UC: [] ← email libre

    UC->>UREPO: match(criteria { nickname })
    UREPO-->>UC: [] ← nickname libre

    UC->>PS: hash(password, cost=12)
    PS-->>UC: passwordHash

    UC->>U: User.register(id, email, passwordHash, nickname, null, 'user', null)
    U->>U: record(new UserRegisteredEvent(...))
    U-->>UC: user

    UC->>UREPO: save(user)
    Note over UREPO: Primero — FK constraint en refresh_tokens

    UC->>RTREPO: save(refreshToken)

    UC->>PUB: publish(user.pullEvents())

    UC-->>C: { accessToken, refreshTokenId }
    C->>C: res.cookie("refreshToken", refreshTokenId, {...})
    C-->>Client: 201 { accessToken }
```

## Flujos de error

```mermaid
sequenceDiagram
    participant UC as UserRegisterer
    participant UREPO as UserRepository
    participant PS as PasswordService

    alt Email ya registrado
        UC->>UREPO: match(criteria { email })
        UREPO-->>UC: [existingUser]
        UC-->>UC: throw EmailAlreadyTaken → 409
    else Nickname ya en uso
        UC->>UREPO: match(criteria { nickname })
        UREPO-->>UC: [existingUser]
        UC-->>UC: throw NicknameAlreadyTaken → 409
    else Password débil
        UC->>PS: validatePolicy("abc")
        PS-->>UC: throw WeakPassword → 422
    end
```
