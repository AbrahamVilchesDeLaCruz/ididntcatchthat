# Logout — Use Case Diagram

```mermaid
graph TD
    Client(["👤 Client"])

    subgraph "POST /auth/logout"
        A["JwtAuthGuard valida<br/>Bearer token"]
        B["Lee refreshToken<br/>de cookie"]
        C{"Token existe y<br/>no está revocado?"}
        D["Revoca token<br/>en DB"]
        E["Limpia cookie<br/>refreshToken"]
    end

    E401(["401 Unauthorized<br/>(JWT inválido)"])
    OK(["204 No Content"])

    Client --> A
    A -- JWT inválido --> E401
    A -- JWT válido --> B --> C
    C -- No (idempotente) --> E
    C -- Sí --> D --> E --> OK

    style E401 fill:#ffe0e0,stroke:#cc0000
    style OK fill:#d4edda,stroke:#28a745
```

## Reglas de negocio

| Regla | Descripción |
|---|---|
| Requiere autenticación | Solo usuarios con JWT válido pueden llamar a este endpoint |
| Idempotencia | Si el token ya estaba revocado o no existe, responde 204 sin error |
| Scope del logout | Solo revoca el token del dispositivo actual (no sesión global) |
| Cookie limpiada | `clearCookie` con mismas opciones que al crear (httpOnly, sameSite) |
