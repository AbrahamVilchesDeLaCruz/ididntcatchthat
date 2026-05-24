# Logout — Class Diagram

```mermaid
classDiagram
    class LogoutAuthPostController {
        -sessionRevoker: SessionRevoker
        +handler(req, res, user): Promise~void~
    }

    class JwtAuthGuard {
        +canActivate(context): boolean
    }

    class CurrentUser {
        <<decorator>>
    }

    class SessionRevoker {
        -userSessionRepository: UserSessionRepository
        +execute(params): Promise~void~
    }

    class UserSession {
        +id: string
        +tokenId: string
        +userId: string | null
        +revokedAt: Date | null
        +isRevoked(): boolean
        +revoke(): UserSession
    }

    class UserSessionRepository {
        <<interface>>
        +match(criteria): Promise~UserSession[]~
        +save(token): Promise~void~
    }

    class Criteria {
        +filters: Filter[]
    }

    LogoutAuthPostController --> SessionRevoker
    LogoutAuthPostController ..> JwtAuthGuard
    LogoutAuthPostController ..> CurrentUser
    SessionRevoker --> UserSessionRepository
    SessionRevoker --> UserSession
    SessionRevoker --> Criteria
```
