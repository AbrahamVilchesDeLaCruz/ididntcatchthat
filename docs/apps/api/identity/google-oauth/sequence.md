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
    participant UC as OAuthAuthenticator
    participant Searcher as UserSearcher
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
    Google-->>Guard: { email, googleId, displayName, avatarUrl }
    Guard-->>CallbackController: UserContext injected via @CurrentUser

    CallbackController->>CallbackController: Build fingerprint<br/>Extract deviceId from cookie

    CallbackController->>UC: execute(id, email, avatarUrl, displayName, deviceId, fingerprint, ip)

    UC->>Searcher: search(email)
    Searcher->>UserRepo: match(Criteria[email = email])
    UserRepo->>DB: SELECT WHERE email = ?
    DB-->>UserRepo: User | null
    UserRepo-->>Searcher: [existing] | []
    Searcher-->>UC: existing | null

    alt existing user
        UC->>UC: user = avatarUrl ? user.addAvatar(avatarUrl) : user
        UC->>UserRepo: save(user)
        UserRepo->>DB: UPDATE users SET avatar_url = ?
        Note over UC: isNewUser = false — no events published
    else new user
        UC->>NicknameResolver: resolve(displayName)
        NicknameResolver-->>UC: unique nickname

        UC->>UC: User.register(id, email, null, nickname, avatarUrl, 'user', 'google')

        UC->>UserRepo: save(user)
        UserRepo->>DB: INSERT users

        UC->>Publisher: publish(user.pullDomainEvents())
        Note over UC: isNewUser = true
    end

    UC->>TokenSvc: generatePair({ type: user, userId, deviceId, fingerprint, ip, roles })
    TokenSvc-->>UC: { accessToken, refreshTokenId }

    UC->>RefreshRepo: save(RefreshToken.create(id, refreshTokenId, userId, deviceId))
    RefreshRepo->>DB: INSERT refresh_token

    UC-->>CallbackController: { accessToken }

    CallbackController->>CallbackController: res.cookie('refreshToken', deviceId, httpOnly)
    CallbackController-->>Client: 200 OK<br/>{ accessToken }<br/>Cookie: refreshToken=<deviceId>
```
