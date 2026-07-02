# Migrate Guest — Sequence Diagram

Flujo de migración del progreso de un usuario guest a su cuenta registrada.
Requiere JWT válido. El cliente envía los datos de progreso del guest (juegos completados)
y el servidor los persiste bajo el userId autenticado, publicando un domain event
para que otros BCs puedan reaccionar.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Guard as JwtAuthGuard
    participant Controller as MigrateGuestAuthPostController
    participant UC as GuestProgressMigrator
    participant MigrationRepo as GuestGameMigrationRepository
    participant Publisher as DomainEventPublisher
    participant DB as PostgreSQL

    Client->>Guard: POST /auth/migrate-guest<br/>Authorization: Bearer <accessToken><br/>Body: { guestDeviceId, guestGames[] }

    Guard->>Guard: Verify JWT
    alt invalid JWT
        Guard-->>Client: 401 Unauthorized
    end

    Guard-->>Controller: UserContext via @CurrentUser

    Controller->>Controller: Map payload → GuestGame[]<br/>(parse dates, structure attempts)

    Controller->>UC: execute({ userId, deviceId, guestDeviceId, guestGames[] })

    alt guestGames.length === 0
        Note over UC: No-op — nothing to migrate
        UC-->>Controller: void
        Controller-->>Client: 204 No Content
    end

    UC->>Publisher: publish(GuestProgressMigratedEvent)
    Publisher-->>GamingHandler: GuestProgressMigrated
    GamingHandler->>DB: UPDATE games SET user_id = userId WHERE id IN (gameIds)
    Publisher-->>ProgressHandler: GuestProgressMigrated
    DB-->>MigrationRepo: OK

    UC->>Publisher: publish([GuestProgressMigratedEvent])
    Note over Publisher: BC Games puede escuchar<br/>este evento para actualizar stats

    UC-->>Controller: void
    Controller-->>Client: 204 No Content
```
