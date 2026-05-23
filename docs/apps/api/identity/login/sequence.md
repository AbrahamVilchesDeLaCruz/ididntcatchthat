# Login — Diagrama de Secuencia

> `POST /auth/login` — controller → use case → domain → persistence

## Flujo exitoso

```mermaid
sequenceDiagram
    actor Client
    participant C as LoginAuthPostController
    participant UC as UserLogger
    participant UREPO as UserRepository
    participant PS as PasswordService
    participant TS as TokenService
    participant RTREPO as RefreshTokenRepository

    Client->>C: POST /auth/login { email, password }
    C->>UC: execute({ email, password })

    UC->>UREPO: match(criteria { email })
    UREPO-->>UC: [user]

    UC->>PS: compare(password, user.passwordHash)
    PS-->>UC: true

    UC->>TS: signAccessToken({ type:"user", userId, email, role })
    TS-->>UC: accessToken

    UC->>RTREPO: save(new RefreshToken({ userId, deviceId, expiresAt: +30d }))
    RTREPO-->>UC: void

    UC-->>C: { accessToken, refreshTokenId }
    C->>C: res.cookie("refreshToken", refreshTokenId, {...})
    C-->>Client: 200 { accessToken }
```

## Flujos de error

```mermaid
sequenceDiagram
    participant UC as UserLogger
    participant UREPO as UserRepository
    participant PS as PasswordService

    alt Email no existe
        UC->>UREPO: match(criteria { email })
        UREPO-->>UC: []
        UC-->>UC: throw InvalidCredentials → 401
        Note over UC: Mismo error que password incorrecta
    else Password incorrecta
        UC->>PS: compare(password, hash)
        PS-->>UC: false
        UC-->>UC: throw InvalidCredentials → 401
        Note over UC: No se revela qué campo falló
    end
```
