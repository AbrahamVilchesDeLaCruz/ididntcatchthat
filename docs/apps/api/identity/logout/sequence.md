# Logout — Sequence Diagram

Flujo de cierre de sesión. Requiere JWT válido en `Authorization: Bearer`. Revoca el refresh token
del dispositivo actual y limpia la cookie. Es **idempotente**: si el token ya estaba revocado, no falla.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Guard as JwtAuthGuard
    participant Controller as LogoutAuthPostController
    participant UC as UserLogouter
    participant RefreshRepo as RefreshTokenRepository
    participant DB as PostgreSQL

    Client->>Guard: POST /auth/logout<br/>Authorization: Bearer <accessToken><br/>Cookie: refreshToken=<tokenId>

    Guard->>Guard: Verify JWT signature + expiry
    alt invalid or missing JWT
        Guard-->>Client: 401 Unauthorized
    end

    Guard-->>Controller: UserContext injected via @CurrentUser

    Controller->>Controller: Extract tokenId from req.cookies

    Controller->>UC: execute({ tokenId })

    UC->>RefreshRepo: match(Criteria[tokenId = tokenId])
    RefreshRepo->>DB: SELECT WHERE token_id = ?
    DB-->>RefreshRepo: RefreshToken | null
    RefreshRepo-->>UC: [token] | []

    alt token not found OR already revoked
        Note over UC: Idempotent — no-op
        UC-->>Controller: void
    else token active
        UC->>RefreshRepo: save(token.revoke())
        RefreshRepo->>DB: UPDATE SET revoked_at = NOW()
        UC-->>Controller: void
    end

    Controller->>Controller: res.clearCookie('refreshToken')
    Controller-->>Client: 204 No Content
```
