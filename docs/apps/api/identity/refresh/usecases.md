# Refresh — Use Case Diagram

```mermaid
graph TD
    Client(["👤 Client"])

    subgraph "POST /auth/refresh"
        A["Lee userSession<br/>de cookie HTTP-only"]
        B{"Token existe?"}
        C{"Token revocado?"}
        D["Revoca TODOS los tokens<br/>activos del usuario<br/>(reuse detection)"]
        E{"Token expirado?"}
        F{"userId === null<br/>(guest token)?"}
        G["Busca usuario en DB"]
        H{"Usuario existe?"}
        I["Revoca token actual<br/>(rotation)"]
        J["Genera nuevo par<br/>accessToken + userSessionId"]
        K["Persiste nuevo<br/>UserSession en DB"]
        L["Devuelve accessToken<br/>Renueva cookie"]
    end

    E401_notfound(["401 InvalidUserSession"])
    E401_compromised(["401 UserSessionCompromised"])
    E401_expired(["401 ExpiredUserSession"])
    E401_guest(["401 InvalidUserSession"])
    E401_nouser(["401 UserNotFound"])

    Client --> A
    A --> B
    B -- No --> E401_notfound
    B -- Sí --> C
    C -- Sí --> D --> E401_compromised
    C -- No --> E
    E -- Sí --> E401_expired
    E -- No --> F
    F -- Sí --> E401_guest
    F -- No --> G --> H
    H -- No --> E401_nouser
    H -- Sí --> I --> J --> K --> L

    style D fill:#ffcccc,stroke:#cc0000
    style E401_notfound fill:#ffe0e0,stroke:#cc0000
    style E401_compromised fill:#ffe0e0,stroke:#cc0000
    style E401_expired fill:#ffe0e0,stroke:#cc0000
    style E401_guest fill:#ffe0e0,stroke:#cc0000
    style E401_nouser fill:#ffe0e0,stroke:#cc0000
    style L fill:#d4edda,stroke:#28a745
```

## Reglas de negocio

| Regla | Descripción |
|---|---|
| Token rotation | Cada refresh revoca el token usado y genera uno nuevo |
| Reuse detection | Si el token presentado ya estaba revocado → revocar TODOS los del usuario |
| Guest tokens | Los tokens con `userId = null` no pueden renovarse |
| Idempotencia | Si el token ya expiró o no existe → 401 sin efectos secundarios |
