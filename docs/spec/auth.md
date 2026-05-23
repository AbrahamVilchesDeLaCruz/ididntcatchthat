# Spec: Auth — Bounded Context Identity

**Estado**: Aprobado  
**Fecha**: 2026-05-22  
**BC**: Identity  
**Scope**: API (`apps/api/src/identity/`)  
**Tasks**: [docs/tasks/auth.md](../tasks/auth.md)

---

## Casos de uso por actor

| Actor | Caso de uso | Endpoint |
|-------|------------|----------|
| Guest | Obtener token guest | `POST /auth/guest` |
| Guest | Registrarse | `POST /auth/register` |
| Guest | Hacer login | `POST /auth/login` |
| Guest | Login con Google | `GET /auth/google` |
| User | Hacer login | `POST /auth/login` |
| User | Login con Google | `GET /auth/google` |
| User | Renovar access token | `POST /auth/refresh` |
| User | Cerrar sesión | `POST /auth/logout` |
| User | Migrar progreso guest | `POST /auth/migrate-guest` |
| Teacher / Admin | Hacer login | `POST /auth/login` |
| Teacher / Admin | Renovar access token | `POST /auth/refresh` |
| Teacher / Admin | Cerrar sesión | `POST /auth/logout` |

> Registro, login y OAuth incluyen `MigrateGuestProgress` si se recibe `guestDeviceId` (fire-and-forget).

---

## Modelo de clases

### Jerarquía de Value Objects

```
StringValueObject (shared)
  ├── UserId          — UUID v4, generate()
  ├── Email           — RFC 5321, max 254, lowercase
  ├── PasswordHash    — no vacío, opaco
  ├── Nickname        — 3–30 chars, alfanumérico + guión
  ├── UserRole        — enum: user | teacher | admin | premium
  └── OauthProvider   — enum: google
```

### Aggregate `User`

```
User extends AggregateRoot<UserPrimitives>
  ├── id: UserId
  ├── email: Email
  ├── passwordHash: PasswordHash | null
  ├── nickname: Nickname
  ├── avatarUrl: string | null
  ├── role: UserRole
  ├── oauthProvider: OauthProvider | null
  ├── showInRanking: boolean
  ├── currentStreak: number
  ├── longestStreak: number
  ├── lastActivityDate: Date | null
  ├── createdAt: Date
  └── updatedAt: Date

  + register(...): User        [static] — crea instancia + record(UserRegisteredEvent)
  + fromPrimitives(p): User    [static] — reconstruye sin eventos
  + toPrimitives(): UserPrimitives
```

### Entidad `RefreshToken`

```
RefreshToken
  ├── id: string
  ├── tokenId: string          — firmado en el JWT refresh
  ├── userId: string
  ├── deviceId: string
  ├── expiresAt: Date
  ├── revokedAt: Date | null
  └── createdAt: Date

  + isRevoked(): boolean
  + isExpired(): boolean
```

### Domain Events

```
DomainEvent (shared)
  ├── UserRegisteredEvent
  │     eventName: ididntcatchthat.identity.users.user.registered
  │     emitido por: User.register()
  │
  └── GuestProgressMigratedEvent
        eventName: ididntcatchthat.identity.users.guest_progress.migrated
        emitido por: GuestProgressMigrator
```

### Domain Errors

```
DomainError (shared)
  ├── EmailAlreadyTaken        → 409
  ├── NicknameAlreadyTaken     → 409
  ├── WeakPassword             → 422
  ├── InvalidCredentials       → 401
  ├── InvalidRefreshToken      → 401
  ├── ExpiredRefreshToken      → 401
  ├── UserSessionCompromised   → 401
  └── UserNotFound             → 404
```

### Repositorios (interfaces)

```
UserRepository
  + match(criteria): Promise<User[]>
  + search(id: UserId): Promise<User | null>
  + save(user: User): Promise<void>
  + remove(id: UserId): Promise<void>
  TOKEN: USER_REPOSITORY

RefreshTokenRepository
  + match(criteria): Promise<RefreshToken[]>
  + search(id): Promise<RefreshToken | null>
  + save(token): Promise<void>
  + remove(id): Promise<void>
  TOKEN: REFRESH_TOKEN_REPOSITORY
```

### Use Cases y dependencias

```
GuestAuthenticator       → RefreshTokenRepository
UserRegisterer           → UserRepository, RefreshTokenRepository
                           ··> GuestProgressMigrator (fire-and-forget)
UserLogger               → UserRepository, RefreshTokenRepository
                           ··> GuestProgressMigrator (fire-and-forget)
TokenRefresher           → RefreshTokenRepository
UserLogouter             → RefreshTokenRepository
GoogleOAuthHandler       → UserRepository, RefreshTokenRepository
                           ··> GuestProgressMigrator (fire-and-forget)
GuestProgressMigrator    → (games/attempts repos — fuera de este BC)
                           ··> emite GuestProgressMigratedEvent
```

---

## Contexto y motivación

La plataforma necesita gestionar tres tipos de identidad:

- **Guest** — accede sin registro, juega con límites, progreso solo en memoria del cliente.
- **User** — registrado con email/password u OAuth Google. Acceso completo y persistido.
- **Teacher / Admin** — roles internos con acceso a backoffice y panel de administración.

El sistema es **stateless** (sin Redis), con JWT access token de vida corta en memoria JS + refresh token en cookie httpOnly. Ver [ADR 018](../adr/018-auth-strategy.md) para el razonamiento completo.

---

## Alcance de este spec

### ✅ Incluido

- `POST /auth/guest` — obtener token de invitado
- `POST /auth/register` — registro con email + password
- `POST /auth/login` — login con email + password
- `POST /auth/refresh` — renovar access token
- `POST /auth/logout` — revocar sesión
- `GET  /auth/google` — iniciar flujo OAuth
- `GET  /auth/google/callback` — callback OAuth Google
- `POST /auth/migrate-guest` — migrar progreso guest al registrarse
- Tablas `users` y `refresh_tokens` en DB
- Migración TypeORM inicial
- Guards y strategies en `shared/infrastructure/auth/`
- Decorator `@CurrentUser`
- Domain events: `UserRegistered`, `GuestProgressMigrated`
- Tests unitarios de domain y use cases (Object Mother)

### ❌ Fuera de alcance (futuro)

- Lógica de Streak (se gestiona cuando llega `GameCompleted`)
- Push subscription (`users.push_subscription`)
- Rol `premium` — reservado en DB pero sin lógica
- 2FA
- Recuperación de contraseña (reset por email)

---

## Modelo de dominio

### Aggregate: `User`

```typescript
type UserPrimitives = {
  id: string;
  email: string;
  passwordHash: string | null;
  nickname: string;
  avatarUrl: string | null;
  role: string;
  oauthProvider: string | null;
  showInRanking: boolean;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
```

Métodos:

- `User.register(...)` — crea instancia + registra `UserRegistered`
- `User.fromPrimitives(...)` — reconstruye desde persistencia (sin eventos)
- `toPrimitives()` — serializa a primitivos

### Value Objects

Nomenclatura: sin sufijo `VO` ni `ValueObject` en nombre de clase ni archivo.

| Clase           | Archivo             | Validación                                               |
| --------------- | ------------------- | -------------------------------------------------------- |
| `UserId`        | `user-id.ts`        | UUID v4 válido                                           |
| `Email`         | `email.ts`          | Formato RFC 5321, max 254 chars, normalizado a lowercase |
| `PasswordHash`  | `password-hash.ts`  | No vacío, opaco                                          |
| `Nickname`      | `nickname.ts`       | 3–30 chars, alfanumérico + guión                         |
| `UserRole`      | `user-role.ts`      | Enum: `user`, `teacher`, `admin`, `premium`              |
| `OauthProvider` | `oauth-provider.ts` | Enum: `google`                                           |

Todos extienden `StringValueObject` de shared. Validación en el constructor — lanzan `DomainError` si inválido.

### Repositorio

Contrato estándar de 4 métodos. Token definido en el mismo archivo.

```typescript
// identity/domain/user.repository.ts
export interface UserRepository {
  match(criteria: Criteria): Promise<User[]>;
  search(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  remove(id: UserId): Promise<void>;
}
export const USER_REPOSITORY = Symbol("UserRepository");
```

> Búsquedas por email o nickname se resuelven via `match(criteria)` — no métodos ad-hoc.

### Entidad: `RefreshToken`

Entidad independiente (no parte del aggregate `User`), con su propio repositorio.

```typescript
// identity/domain/refresh-token.repository.ts
export interface RefreshTokenRepository {
  match(criteria: Criteria): Promise<RefreshToken[]>;
  search(id: RefreshTokenId): Promise<RefreshToken | null>;
  save(token: RefreshToken): Promise<void>;
  remove(id: RefreshTokenId): Promise<void>;
}
export const REFRESH_TOKEN_REPOSITORY = Symbol("RefreshTokenRepository");
```

Campos: `id`, `tokenId` (firmado en JWT), `userId`, `deviceId`, `expiresAt`, `revokedAt | null`, `createdAt`.

---

## Schema DB

### Tabla `users`

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(254) UNIQUE NOT NULL,
  password_hash   VARCHAR NULL,
  nickname        VARCHAR(30) UNIQUE NOT NULL,
  avatar_url      VARCHAR NULL,
  role            VARCHAR NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user','teacher','admin','premium')),
  oauth_provider  VARCHAR NULL CHECK (oauth_provider IN ('google')),
  show_in_ranking BOOLEAN NOT NULL DEFAULT false,
  push_subscription JSONB NULL,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  last_activity_date DATE NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP NOT NULL DEFAULT now()
);
```

### Tabla `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id    VARCHAR NOT NULL UNIQUE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id   VARCHAR NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  revoked_at  TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_id ON refresh_tokens(token_id);
```

---

## Casos de uso (Application)

Naming: `{Entity}{Verb}` en forma de agente. Método siempre `execute()`. Reciben primitivos.

### `GuestAuthenticator`

**Entrada**: `{ userAgent: string, acceptLanguage: string, ip: string }`  
**Salida**: `{ accessToken: string, deviceId: string }`

**Flujo**:

1. Generar `deviceId` (UUID).
2. Calcular `fingerprint = hash(userAgent + acceptLanguage + ip)`.
3. Firmar JWT access: `{ type: "guest", deviceId, fingerprint, ip }`, TTL 15min.
4. Persistir `RefreshToken` en repo (para rate limiting por deviceId): TTL 30d.
5. Devolver `{ accessToken, deviceId }`.

> El refresh token guest se guarda para permitir `POST /auth/refresh` y control de límite de partidas (3/día por deviceId).

---

### `UserRegisterer`

**Entrada**: `{ email: string, password: string, nickname: string, guestDeviceId?: string }`  
**Salida**: `{ accessToken: string }` + cookie `refreshToken` (seteada por el controller)

**Flujo**:

1. Verificar unicidad de `email` via `match(criteria)` → `EmailAlreadyTaken` si existe.
2. Verificar unicidad de `nickname` via `match(criteria)` → `NicknameAlreadyTaken` si existe.
3. Validar política de password (min 8 chars, 1 mayúscula, 1 número) → `WeakPassword`.
4. Hashear con bcrypt (cost 12).
5. `User.register(...)` → aggregate + `UserRegistered` domain event.
6. `repository.save(user)`.
7. Publicar domain events del aggregate.
8. Si `guestDeviceId` presente → lanzar `GuestProgressMigrator` (fire-and-forget).
9. Generar `deviceId` (reutilizar del guest si aplica), firmar access token, persistir refresh token.
10. Devolver `{ accessToken, deviceId }`.

---

### `UserLogger`

**Entrada**: `{ email: string, password: string, guestDeviceId?: string }`  
**Salida**: `{ accessToken: string }`

**Flujo**:

1. Buscar user por email via `match(criteria)` → `InvalidCredentials` si no existe.
2. `bcrypt.compare` → `InvalidCredentials` si no coincide.
3. Si `guestDeviceId` → lanzar `GuestProgressMigrator` (fire-and-forget).
4. Generar tokens, devolver `{ accessToken }`.

---

### `TokenRefresher`

**Entrada**: `{ tokenId: string }` (extraído de la cookie por el controller)  
**Salida**: `{ accessToken: string, newRefreshTokenId: string }`

**Flujo**:

1. Buscar `RefreshToken` via `match(criteria)` por `tokenId` → `InvalidRefreshToken` si no existe o revocado.
2. Verificar `expiresAt > now()` → `ExpiredRefreshToken` si expirado.
3. **Rotation**: revocar token actual (`revokedAt = now()`), `repository.save`.
4. Si el mismo `tokenId` se usa una segunda vez (ya estaba revocado) → revocar TODOS los tokens del usuario (`match` por userId) + `UserSessionCompromised`.
5. Crear nuevo `RefreshToken`, firmar nuevo access token.
6. Devolver `{ accessToken, newRefreshTokenId }`.

---

### `UserLogouter`

**Entrada**: `{ tokenId: string }`  
**Salida**: `void`

**Flujo**:

1. Buscar `RefreshToken` por `tokenId`.
2. `revokedAt = now()`, `repository.save`.
3. (Controller borra la cookie.)

---

### `GoogleOAuthHandler`

**Entrada**: `{ googleProfile: GoogleProfile, guestDeviceId?: string }`  
**Salida**: `{ accessToken: string, isNewUser: boolean }`

**Flujo**:

1. Buscar user por email via `match(criteria)`.
2. Si no existe → `User.register(...)` con `oauthProvider: 'google'`, `passwordHash: null`, nickname auto-generado.
3. Si existe → actualizar `avatarUrl` si cambió.
4. Solo emite `UserRegistered` si el user es nuevo.
5. Si `guestDeviceId` → lanzar `GuestProgressMigrator` (fire-and-forget).
6. Generar tokens, devolver `{ accessToken, isNewUser }`.

---

### `GuestProgressMigrator`

**Entrada**: `{ newUserId: string, guestGames: GuestGamePrimitive[] }`  
**Salida**: `void`

**Flujo**:

1. Para cada `guestGame`: INSERT en `games` con `userId = newUserId`, INSERT en `attempts`.
2. UPSERT `user_flashcard_stats` — acumula sobre lo que ya hubiera.
3. Emitir `GuestProgressMigrated`.

> Idempotente: mismo `gameId` → no duplica.

---

## Domain Events

| Evento                       | `eventName`                                              | Cuándo                                        |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| `UserRegisteredEvent`        | `ididntcatchthat.identity.users.user.registered`         | `User.register()` — solo si el user es nuevo  |
| `GuestProgressMigratedEvent` | `ididntcatchthat.identity.users.guest_progress.migrated` | `GuestProgressMigrator` completa la migración |

---

## Endpoints REST

| Método | Ruta                    | Use Case                | Auth               |
| ------ | ----------------------- | ----------------------- | ------------------ |
| `POST` | `/auth/guest`           | `GuestAuthenticator`    | Ninguna            |
| `POST` | `/auth/register`        | `UserRegisterer`        | Ninguna            |
| `POST` | `/auth/login`           | `UserLogger`            | Ninguna            |
| `POST` | `/auth/refresh`         | `TokenRefresher`        | Cookie refresh     |
| `POST` | `/auth/logout`          | `UserLogouter`          | Cookie refresh     |
| `GET`  | `/auth/google`          | —                       | Ninguna (redirect) |
| `GET`  | `/auth/google/callback` | `GoogleOAuthHandler`    | Ninguna            |
| `POST` | `/auth/migrate-guest`   | `GuestProgressMigrator` | Bearer (user)      |

---

## Domain Errors

| Clase                    | Status HTTP | Cuándo                                                |
| ------------------------ | ----------- | ----------------------------------------------------- |
| `EmailAlreadyTaken`      | 409         | Email ya registrado                                   |
| `NicknameAlreadyTaken`   | 409         | Nickname ya en uso                                    |
| `WeakPassword`           | 422         | Password no cumple política                           |
| `InvalidCredentials`     | 401         | Email o password incorrectos (mismo error para ambos) |
| `InvalidRefreshToken`    | 401         | Token no existe o revocado                            |
| `ExpiredRefreshToken`    | 401         | Token expirado                                        |
| `UserSessionCompromised` | 401         | Token reusado — posible robo de sesión                |
| `UserNotFound`           | 404         | Uso interno (domain service)                          |

---

## Guards, strategies y decoradores

Todos viven en `shared/infrastructure/auth/` — son transversales a toda la app.

| Artefacto        | Archivo                     | Descripción                                          |
| ---------------- | --------------------------- | ---------------------------------------------------- |
| `JwtStrategy`    | `jwt.strategy.ts`           | Valida Bearer token, adjunta `UserContext` a request |
| `GoogleStrategy` | `google.strategy.ts`        | OAuth Google via Passport                            |
| `JwtAuthGuard`   | `jwt.guard.ts`              | Protege endpoints — lanza 401 si token inválido      |
| `RolesGuard`     | `roles.guard.ts`            | Verifica rol del JWT — lanza 403 si no autorizado    |
| `@CurrentUser`   | `current-user.decorator.ts` | Extrae `UserContext` del request                     |
| `@Public`        | `public.decorator.ts`       | Marca endpoints sin auth                             |
| `@Roles(...)`    | `roles.decorator.ts`        | Metadata para `RolesGuard`                           |

### `UserContext` (shared/domain)

```typescript
// shared/domain/user-context.ts
export type UserContext = {
  type: "guest" | "user" | "teacher" | "admin";
  deviceId: string;
  fingerprint?: string;
  ip: string;
  userId?: string;
  email?: string;
  roles?: string[];
};
```

---

## Estructura de archivos

```
apps/api/src/
  shared/
    domain/
      user-context.ts
    infrastructure/
      auth/
        jwt.strategy.ts
        jwt.guard.ts
        google.strategy.ts
        google.guard.ts
        roles.guard.ts
        current-user.decorator.ts
        public.decorator.ts
        roles.decorator.ts
        auth.module.ts

  identity/
    domain/
      user.ts                          ← Aggregate Root
      refresh-token.ts                 ← Entidad
      user-id.ts                       ← VO (sin sufijo)
      email.ts
      password-hash.ts
      nickname.ts
      user-role.ts
      oauth-provider.ts
      user.repository.ts               ← interface + token USER_REPOSITORY
      refresh-token.repository.ts      ← interface + token REFRESH_TOKEN_REPOSITORY
      errors/
        email-already-taken.ts
        nickname-already-taken.ts
        weak-password.ts
        invalid-credentials.ts
        invalid-refresh-token.ts
        expired-refresh-token.ts
        user-session-compromised.ts
        user-not-found.ts
      events/
        user-registered.event.ts
        guest-progress-migrated.event.ts

    application/
      guest/
        guest-authenticator.ts
      register/
        user-registerer.ts
      login/
        user-logger.ts
      refresh/
        token-refresher.ts
      logout/
        user-logouter.ts
      google/
        google-oauth-handler.ts
      migrate-guest/
        guest-progress-migrator.ts
        guest-game.primitive.ts        ← tipo primitivo de entrada (no clase DTO)

    infrastructure/
      controllers/
        guest-auth-post.controller.ts
        guest-auth-post.payload.ts
        register-auth-post.controller.ts
        register-auth-post.payload.ts
        login-auth-post.controller.ts
        login-auth-post.payload.ts
        refresh-auth-post.controller.ts
        logout-auth-post.controller.ts
        google-auth-get.controller.ts
        google-callback-auth-get.controller.ts
        migrate-guest-auth-post.controller.ts
        migrate-guest-auth-post.payload.ts
      persistence/
        user.entity.ts
        refresh-token.entity.ts
        typeorm-user.repository.ts
        typeorm-refresh-token.repository.ts
      framework/
        identity.module.ts

apps/api/test/
  identity/
    domain/
      user-mother.ts
      user-id-mother.ts
      email-mother.ts
      nickname-mother.ts
      refresh-token-mother.ts
    application/
      guest/
        guest-authenticator.spec.ts
        request-guest-authenticator-mother.ts
      register/
        user-registerer.spec.ts
        request-user-registerer-mother.ts
      login/
        user-logger.spec.ts
        request-user-logger-mother.ts
      refresh/
        token-refresher.spec.ts
      logout/
        user-logouter.spec.ts
      migrate-guest/
        guest-progress-migrator.spec.ts
  shared/
    domain/
      mother-creator.ts
      string-mother.ts
      uuid-mother.ts
      date-mother.ts
      boolean-mother.ts
```

---

## Criterios de aceptación

### Guest token

- [x] `POST /auth/guest` devuelve `accessToken` + `deviceId` sin autenticación previa.
- [x] El payload del `accessToken` contiene `type: "guest"`, `deviceId`, `fingerprint`, `ip`.
- [x] El access token expira a los 15 minutos.
- [x] `POST /auth/refresh` con cookie válida devuelve nuevo `accessToken` (rotation).

### Registro

- [x] `POST /auth/register` crea user, devuelve `accessToken` y setea cookie `refreshToken`.
- [x] Email duplicado → 409 `EmailAlreadyTaken`.
- [x] Nickname duplicado → 409 `NicknameAlreadyTaken`.
- [x] Password débil → 422 `WeakPassword`.
- [ ] Se emite `UserRegisteredEvent` en el event bus. _(pendiente: event bus en infra — actualmente NooopDomainEventPublisher)_

### Login

- [x] `POST /auth/login` con credenciales válidas → 200 + `accessToken` + cookie.
- [x] Email incorrecto → 401 `InvalidCredentials`.
- [x] Password incorrecta → 401 `InvalidCredentials` (mismo mensaje — no revelar qué campo falló).

### Refresh + logout

- [x] Refresh exitoso → 200 + rotation del refresh token.
- [x] Mismo `tokenId` usado dos veces → 401 + todos los tokens del usuario revocados.
- [x] Token expirado → 401 `ExpiredRefreshToken`.
- [x] Logout → 204 + cookie borrada.
- [x] Refresh tras logout → 401 `InvalidRefreshToken`.

### OAuth Google

- [ ] `GET /auth/google` redirige a Google. _(pendiente: requiere vars OAuth en entorno)_
- [ ] Callback crea user si no existe, hace login si existe. _(pendiente)_
- [ ] `UserRegisteredEvent` solo se emite si el user es nuevo. _(pendiente)_

### Migración guest

- [ ] `POST /auth/migrate-guest` persiste games + attempts + stats. _(pendiente: depende de BC games)_
- [ ] Idempotente: llamar dos veces con los mismos datos no duplica registros. _(pendiente)_
- [ ] Se emite `GuestProgressMigratedEvent`. _(pendiente)_

### Guards

- [x] Endpoint protegido sin token → 401.
- [x] Endpoint protegido con token guest → 401 (si requiere role `user`).
- [x] Endpoint de teacher/admin con token `user` → 403.

---

## Notas de implementación

- **bcrypt cost**: 12.
- **JWT secrets**: `JWT_SECRET` (access) y `JWT_REFRESH_SECRET` (refresh) — validados con Joi en `SharedModule`.
- **Cookie**: `httpOnly: true`, `secure: true` (prod), `sameSite: 'strict'`, `path: '/auth/refresh'`.
- **Nickname auto-generado (OAuth)**: parte antes del `@` del email, sanitizado a alfanumérico + guiones; sufijo numérico aleatorio si hay colisión.
- **`GuestProgressMigrator` es fire-and-forget** — el controller no espera resolución. Errores se loggean, no propagan.
- **Rate limiting** en `/auth/guest` — fuera de este spec, se añade en `infra/rate-limiting`.

---

## Notas de implementación real (divergencias y decisiones)

> Esta sección documenta lo que difiere o complementa al spec original, descubierto durante la implementación.

### `RefreshToken.userId` es `string | null`

El spec original declaraba `userId: string`. Durante la implementación se descubrió que los tokens **guest** no tienen userId asociado (no existe un `User` en DB para ellos). La entidad se cambió a `userId: string | null`.

```typescript
// identity/domain/refresh-token.ts
userId: string | null  // null para tokens guest
```

### La cookie lleva `refreshTokenId` (JWT JTI), NO `deviceId`

El spec decía "devolver `deviceId`" en la cookie del refresh token. En realidad el controller `RefreshAuthPostController` busca en DB por `tokenId` (el JTI del JWT), no por `deviceId`. Por tanto la cookie debe contener el JTI, y los use cases devuelven `{ accessToken, refreshTokenId }`.

```typescript
// Correcto
res.cookie('refreshToken', result.refreshTokenId, cookieOptions)

// Incorrecto (causaba 401 siempre)
res.cookie('refreshToken', result.deviceId, cookieOptions)
```

### `ValidationPipe` usa `errorHttpStatusCode: 422`

Los errores de validación de payload (`class-validator`) devuelven `422 Unprocessable Entity`, no `400 Bad Request`. Esto incluye campos desconocidos (`forbidNonWhitelisted: true`).

### Cookie en supertest: solo `key=value`, sin atributos

Al extraer la cookie de la respuesta para reenviarla en tests E2E, hay que hacer `split(';')[0]` para quedarse solo con `refreshToken=<value>`. El header `Cookie` no acepta atributos como `HttpOnly`, `SameSite`, etc.

```typescript
const fullCookie = res.headers['set-cookie'][0]
const refreshTokenCookie = fullCookie.split(';')[0] // "refreshToken=<value>"
```

### `APP_FILTER` con `useExisting` en `SharedModule`

Para que el filtro global de excepciones sea DI-aware (y pueda inyectar `GlobalExceptionRegistry`), se registra como:

```typescript
{ provide: APP_FILTER, useExisting: HttpExceptionFilter }
```

No `useClass`, porque `useClass` crea una instancia separada sin DI del módulo completo.

### `UserRegisterer`: save secuencial (FK constraint)

`user` se guarda antes que `refreshToken` porque `refresh_tokens.user_id` tiene FK → `users.id`. Un save paralelo o invertido lanza error de FK en Postgres.

### Domain Event Publisher actual: Noop

`identity/infrastructure/framework/noop-domain-event-publisher.ts` — no publica eventos al bus real (AMQP). El event bus está previsto para cuando se implemente `api-events-infra`. Por eso el criterio de aceptación "Se emite `UserRegisteredEvent` en el event bus" queda pendiente.

### Estructura de archivos real vs. spec

El spec indicaba `errors/` como subdirectorio pero la implementación usa `exceptions/` (alineado con la convención NestJS del proyecto):

```
identity/domain/exceptions/   ← implementado
identity/domain/errors/       ← lo que decía el spec original
```
