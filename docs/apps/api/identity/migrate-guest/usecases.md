# Migrate Guest — Use Case Diagram

```mermaid
graph TD
    Client(["👤 Client (usuario registrado)"])

    subgraph "POST /auth/migrate-guest"
        A["JwtAuthGuard valida<br/>Bearer token"]
        B["Mapea payload<br/>GuestGame[]"]
        C{"guestGames<br/>vacío?"}
        D["migrateGames(userId, guestGames)"]
        E["Publica GuestProgressMigratedEvent"]
    end

    E401(["401 Unauthorized"])
    OK204(["204 No Content"])

    Client --> A
    A -- JWT inválido --> E401
    A -- JWT válido --> B --> C
    C -- Sí (no-op) --> OK204
    C -- No --> D --> E --> OK204

    style E fill:#fff3cd,stroke:#ffc107
    style E401 fill:#ffe0e0,stroke:#cc0000
    style OK204 fill:#d4edda,stroke:#28a745
```

## Reglas de negocio

| Regla | Descripción |
|---|---|
| Requiere autenticación | Solo usuarios registrados con JWT válido pueden migrar progreso |
| No-op en vacío | Si `guestGames` está vacío, responde 204 sin tocar la DB |
| `userId` del JWT | La identidad destino siempre viene del token, no del body |
| `guestDeviceId` del body | Identifica el dispositivo guest del que provienen los juegos |
| Evento de dominio | `GuestProgressMigratedEvent` notifica a BC Games para actualizar ranking/stats |
| Idempotencia | Si los juegos ya fueron migrados, la lógica está en el repositorio (upsert) |
