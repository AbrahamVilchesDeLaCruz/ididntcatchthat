# Guest Auth — Diagrama de Secuencia

> `POST /auth/guest` — controller → use case → domain → persistence

```mermaid
sequenceDiagram
    actor Client
    participant C as GuestAuthPostController
    participant UC as GuestAuthenticator
    participant TS as TokenService
    participant RTREPO as UserSessionRepository

    Client->>C: POST /auth/guest { fingerprint, ip }
    C->>UC: execute({ fingerprint, ip })

    UC->>UC: deviceId = crypto.randomUUID()

    UC->>TS: generateGuest({ deviceId, fingerprint, ip })
    TS-->>UC: { accessToken, userSessionId }

    UC->>UC: UserSession.create(id, userSessionId, null, deviceId)
    Note over UC: userId es null — no hay User en DB para guests

    UC->>RTREPO: save(userSession)
    RTREPO-->>UC: void

    UC-->>C: { accessToken, deviceId }

    C->>C: res.cookie("userSession", userSessionId, { httpOnly, sameSite:"strict" })
    C-->>Client: 200 { accessToken, deviceId }
```
