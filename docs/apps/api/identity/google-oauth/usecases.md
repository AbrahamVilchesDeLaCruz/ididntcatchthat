# Google OAuth — Use Case Diagram

```mermaid
graph TD
    Client(["👤 Client"])

    subgraph "GET /auth/google"
        A["Redirect a Google<br/>consent screen"]
    end

    subgraph "GET /auth/google/callback"
        B["GoogleAuthGuard valida<br/>código OAuth"]
        C{"Usuario existe<br/>en DB?"}
        D["Actualiza avatarUrl<br/>si se provee"]
        E["Genera nickname único"]
        F["User.register()<br/>oauthProvider: google<br/>passwordHash: null"]
        G["Publica UserRegistered"]
        H["Genera access + refresh tokens"]
        I["Persiste RefreshToken en DB"]
        J["Set cookie refreshToken<br/>Devuelve accessToken"]
    end

    Client --> A --> B
    B -- Sí --> C
    C -- Sí --> D --> H
    C -- No --> E --> F --> G --> H
    H --> I --> J

    style G fill:#fff3cd,stroke:#ffc107
    style J fill:#d4edda,stroke:#28a745
```

## Reglas de negocio

| Regla | Descripción |
|---|---|
| Usuario existente | Si el email ya está en DB → actualizar avatar, no crear nuevo usuario |
| Usuario nuevo | `passwordHash = null`, `oauthProvider = 'google'`, nickname derivado de `displayName` |
| Nickname único | `NicknameResolverService` garantiza unicidad (añade sufijo numérico si colisiona) |
| Evento de dominio | `UserRegistered` solo se publica para usuarios **nuevos** |
| `UserSearcher` | Domain Service que encapsula la búsqueda por email vía `UserRepository.match` |
| Response | Solo devuelve `accessToken` — sin `isNewUser` |
