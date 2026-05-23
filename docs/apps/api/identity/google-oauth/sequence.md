# Google OAuth — Sequence Diagram

Flujo de autenticación con Google. Dos controladores participan:
- `GET /auth/google` → inicia el redirect a Google
- `GET /auth/google/callback` → recibe el callback con el perfil del usuario

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant InitController as GoogleAuthGetController
    participant CallbackController as GoogleCallbackAuthGetController
    participant Guard as GoogleAuthGuard (Passport)
    participant Google as Google OAuth2
    participant UC as GoogleOAuthHandler
    participant UserRepo as UserRepository
    participant NicknameResolver as NicknameResolverService
    participant RefreshRepo as RefreshTokenRepository
    participant TokenSvc as TokenService
    participant Publisher as DomainEventPublisher
    participant DB as PostgreSQL

    Client->>InitController: GET /auth/google
    InitController->>Guard: GoogleAuthGuard redirects
    Guard->>Google: Redirect to accounts.google.com/o/oauth2/auth
    Google-->>Client: Consent screen

    Client->>Google: User approves
    Google->>CallbackController: GET /auth/google/callback?code=...
    CallbackController->>Guard: GoogleAuthGuard validates code
    Guard->>Google: Exchange code for profile
    Google-->>Guard: { email, googleId, displayName }
    Guard-->>CallbackController: UserContext injected via @CurrentUser

    CallbackController->>CallbackController: Build fingerprint<br/>Assign deviceId

    CallbackController->>UC: execute({ id, email, googleId, avatarUrl, displayName, deviceId, fingerprint, ip })

    UC->>UserRepo: match(Criteria[email = email])
    UserRepo->>DB: SELECT WHERE email = ?
    DB-->>UserRepo: User | null
    UserRepo-->>UC: [existing] | []

    alt existing user
        UC->>UserRepo: save(user.withAvatar(avatarUrl))
        UserRepo->>DB: UPDATE users SET avatar_url = ?
        Note over UC: isNewUser = false
    else new user
        UC->>NicknameResolver: resolve(displayName)
        NicknameResolver-->>UC: unique nickname

        UC->>UC: User.register({ id, email, passwordHash: null,<br/>nickname, avatarUrl, role: user,<br/>oauthProvider: google, deviceId })

        UC->>UserRepo: save(user)
        UserRepo->>DB: INSERT users

        UC->>Publisher: publish(UserRegistered event)
        Note over UC: isNewUser = true
    end

    UC->>TokenSvc: generatePair({ type: user, userId, deviceId, fingerprint, ip, roles })
    TokenSvc-->>UC: { accessToken, refreshTokenId }

    UC->>RefreshRepo: save(RefreshToken.create({ tokenId: refreshTokenId, userId, deviceId }))
    RefreshRepo->>DB: INSERT refresh_token

    UC-->>CallbackController: { accessToken, isNewUser }

    CallbackController->>CallbackController: res.cookie('refreshToken', deviceId, httpOnly)
    CallbackController-->>Client: 200 OK<br/>{ accessToken, isNewUser }<br/>Cookie: refreshToken=<deviceId>
```
