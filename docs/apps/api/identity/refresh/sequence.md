# Refresh — Sequence Diagram

Flujo de renovación de access token usando el refresh token almacenado en cookie HTTP-only.

Incluye detección de **token reuse** (reuse detection attack): si el token presentado ya fue revocado,
se revocan TODOS los tokens activos del usuario.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as RefreshAuthPostController
    participant UC as TokenRefresher
    participant RefreshRepo as UserSessionRepository
    participant UserRepo as UserRepository
    participant TokenSvc as TokenGenerator
    participant DB as PostgreSQL

    Client->>Controller: POST /auth/refresh<br/>Cookie: userSession=<tokenId>

    Controller->>Controller: Extract tokenId from req.cookies<br/>Build fingerprint (UA + lang + IP)

    Controller->>UC: execute({ tokenId, deviceId, fingerprint, ip })

    UC->>RefreshRepo: match(Criteria[tokenId = tokenId])
    RefreshRepo->>DB: SELECT WHERE token_id = ?
    DB-->>RefreshRepo: UserSession | null
    RefreshRepo-->>UC: [token] | []

    alt token not found
        UC-->>Controller: throw InvalidUserSessionException
        Controller-->>Client: 401 Unauthorized
    end

    alt token.isRevoked()
        Note over UC: Token reuse detected!
        UC->>RefreshRepo: match(Criteria[userId = token.userId])
        RefreshRepo->>DB: SELECT WHERE user_id = ?
        DB-->>RefreshRepo: UserSession[]
        RefreshRepo-->>UC: allUserTokens

        loop for each active token
            UC->>RefreshRepo: save(token.revoke())
            RefreshRepo->>DB: UPDATE SET revoked_at = NOW()
        end

        UC-->>Controller: throw UserSessionCompromisedException
        Controller-->>Client: 401 Unauthorized
    end

    alt token.isExpired()
        UC-->>Controller: throw ExpiredUserSessionException
        Controller-->>Client: 401 Unauthorized
    end

    alt token.userId === null (guest token)
        UC-->>Controller: throw InvalidUserSessionException
        Controller-->>Client: 401 Unauthorized
    end

    UC->>UserRepo: search(UserId)
    UserRepo->>DB: SELECT WHERE id = ?
    DB-->>UserRepo: User | null
    UserRepo-->>UC: user

    alt user not found
        UC-->>Controller: throw UserNotFoundException
        Controller-->>Client: 401 Unauthorized
    end

    Note over UC: Token rotation — revoke old, issue new

    UC->>RefreshRepo: save(token.revoke())
    RefreshRepo->>DB: UPDATE SET revoked_at = NOW()

    UC->>TokenSvc: generatePair({ type: user, userId, deviceId, fingerprint, ip, roles })
    TokenSvc-->>UC: { accessToken, userSessionId }

    UC->>RefreshRepo: save(UserSession.create(id, userSessionId, userId, deviceId))
    RefreshRepo->>DB: INSERT user_session

    UC-->>Controller: { accessToken }

    Controller->>Controller: res.cookie('userSession', tokenId, httpOnly)
    Controller-->>Client: 200 OK<br/>{ accessToken }<br/>Cookie: userSession=<tokenId> (renovada)
```
