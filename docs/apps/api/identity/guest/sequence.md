# Guest Auth — Diagrama de Secuencia

> `POST /auth/guest` — controller → use case → domain → persistence

```mermaid
sequenceDiagram
    actor Client
    participant C as GuestAuthPostController
    participant UC as GuestAuthenticator
    participant TS as TokenGenerator
    participant RTREPO as UserSessionRepository
    participant EP as DomainEventPublisher

    Client->>C: POST /auth/guest { fingerprint, ip, user-agent, accept-language }
    C->>C: FingerprintBuilder.fromRequest(ua, lang, ip)
    C->>UC: execute({ fingerprint, ip })

    UC->>UC: deviceId = crypto.randomUUID()

    UC->>TS: generateGuest({ deviceId, fingerprint, ip })
    TS-->>UC: { accessToken, refreshTokenId }

    UC->>UC: UserSession.createGuest(id, refreshTokenId, deviceId, fingerprint)
    Note over UC: ownerId === deviceId — explícito, no null

    UC->>RTREPO: save(session)
    RTREPO-->>UC: void

    UC->>EP: publish(session.pullDomainEvents())
    EP-->>UC: void
    Note over EP: SessionStartedEvent

    UC-->>C: { accessToken, deviceId }

    C->>C: res.cookie("refreshToken", deviceId, { httpOnly, sameSite:"strict", secure })
    C-->>Client: 200 { accessToken, deviceId }
```
