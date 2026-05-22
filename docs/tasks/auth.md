# Tasks: Auth — Bounded Context Identity

**Spec**: [docs/spec/auth.md](../spec/auth.md)  
**Tasks**: este archivo (`docs/tasks/auth.md`)  
**ADR**: [docs/adr/018-auth-strategy.md](../adr/018-auth-strategy.md)  
**Rama de implementación**: `feat/auth-identity`  
**Orden**: secuencial — cada bloque depende del anterior

---

## Bloque 1 — Shared infrastructure (prereqs)

> Artefactos transversales que toda la app usará. Van en `shared/`.

- [ ] **TASK-AUTH-01** — `UserContext` type en `shared/domain/user-context.ts`
  - Type con campos: `type`, `deviceId`, `fingerprint?`, `ip`, `userId?`, `email?`, `roles?`

- [ ] **TASK-AUTH-02** — Mothers base en `test/shared/domain/`
  - `MotherCreator` (faker vive aquí), `StringMother`, `UuidMother`, `DateMother`, `BooleanMother`
  - Son los únicos que importan faker — los demás Mothers los usan a ellos

- [ ] **TASK-AUTH-03** — Strategies y Guards en `shared/infrastructure/auth/`
  - `JwtStrategy` — valida Bearer, devuelve `UserContext`
  - `GoogleStrategy` — OAuth Google via passport-google-oauth20
  - `JwtAuthGuard`, `RolesGuard`
  - Decoradores: `@CurrentUser`, `@Public`, `@Roles(...)`
  - `AuthModule` que exporta todo lo anterior

---

## Bloque 2 — Domain

> TypeScript puro. Sin NestJS, sin TypeORM. Todo testeable sin I/O.

- [ ] **TASK-AUTH-04** — Value Object `UserId`
  - Extiende `StringValueObject`. UUID v4 válido. Método `UserId.generate()`.
  - Test: válido, inválido lanza `UserIdInvalid`

- [ ] **TASK-AUTH-05** — Value Object `Email`
  - Extiende `StringValueObject`. Formato RFC, max 254 chars, normalizado a lowercase en constructor.
  - Test: emails válidos, inválidos, mayúsculas normalizadas

- [ ] **TASK-AUTH-06** — Value Object `PasswordHash`
  - Extiende `StringValueObject`. No vacío, opaco.
  - Test: válido, vacío lanza error

- [ ] **TASK-AUTH-07** — Value Object `Nickname`
  - Extiende `StringValueObject`. 3–30 chars, solo alfanumérico + guión.
  - Test: válido, demasiado corto/largo, chars inválidos

- [ ] **TASK-AUTH-08** — Value Objects `UserRole` y `OauthProvider`
  - Extienden `StringValueObject`. Factory `create(value: string)` con validación de enum.
  - Test: valores válidos e inválidos para cada uno

- [ ] **TASK-AUTH-09** — Domain Errors
  - `EmailAlreadyTaken`, `NicknameAlreadyTaken`, `WeakPassword`, `InvalidCredentials`
  - `InvalidRefreshToken`, `ExpiredRefreshToken`, `UserSessionCompromised`, `UserNotFound`
  - Todos extienden `DomainError` de shared. Sin sufijo `Error` ni `Exception`.

- [ ] **TASK-AUTH-10** — Domain Events `UserRegisteredEvent` y `GuestProgressMigratedEvent`
  - Extienden `DomainEvent`. `eventName()` con formato `ididntcatchthat.identity.users.*`.
  - Atributos mínimos para los consumers (ver `bounded-contexts-detail.md`).

- [ ] **TASK-AUTH-11** — Aggregate `User`
  - `User.register(...)` → crea instancia + `record(new UserRegisteredEvent(...))`.
  - `User.fromPrimitives(...)` → reconstruye sin eventos.
  - `toPrimitives()` → `UserPrimitives`.
  - Test: `register` genera evento, `fromPrimitives` no genera eventos, getters correctos.
  - Mother: `UserMother` con `random(overrides?)`, `UserIdMother`, `EmailMother`, `NicknameMother`.

- [ ] **TASK-AUTH-12** — Entidad `RefreshToken` y su repositorio
  - Campos: `id`, `tokenId`, `userId`, `deviceId`, `expiresAt`, `revokedAt | null`, `createdAt`.
  - Interface `RefreshTokenRepository` + token `REFRESH_TOKEN_REPOSITORY` en mismo archivo.
  - Interface `UserRepository` + token `USER_REPOSITORY` en mismo archivo.
  - Contratos: `match`, `search`, `save`, `remove` — sin métodos ad-hoc.

---

## Bloque 3 — Application (Use Cases)

> Reciben primitivos. Usan repositorios via interface. Mockeados en tests con `jest-mock-extended`.

- [ ] **TASK-AUTH-13** — `GuestAuthenticator`
  - Genera `deviceId`, fingerprint, firma JWT guest, persiste `RefreshToken`.
  - Test: access token con payload correcto, `deviceId` retornado, refresh token persistido.
  - Mother: `RequestGuestAuthenticatorMother`.

- [ ] **TASK-AUTH-14** — `UserRegisterer`
  - Verifica unicidad email/nickname via `match(criteria)`, valida password policy, hashea, crea `User`, publica eventos, lanza `GuestProgressMigrator` fire-and-forget si aplica.
  - Test: registro exitoso, `EmailAlreadyTaken`, `NicknameAlreadyTaken`, `WeakPassword`, evento publicado.
  - Mother: `RequestUserRegistererMother`.

- [ ] **TASK-AUTH-15** — `UserLogger`
  - Busca por email via `match(criteria)`, compara hash, genera tokens.
  - Test: login exitoso, email inexistente → `InvalidCredentials`, password incorrecta → mismo `InvalidCredentials`.
  - Mother: `RequestUserLoggerMother`.

- [ ] **TASK-AUTH-16** — `TokenRefresher`
  - Busca token, verifica expiración, rotation. Detección de token reusado → revocar todos + `UserSessionCompromised`.
  - Test: refresh exitoso, token revocado, token expirado, token reutilizado (todos los del user revocados).

- [ ] **TASK-AUTH-17** — `UserLogouter`
  - Revoca refresh token.
  - Test: logout exitoso, token ya revocado (idempotente — no lanza error).

- [ ] **TASK-AUTH-18** — `GoogleOAuthHandler`
  - Crea o recupera User. Nickname auto-generado con sanitización + sufijo si colisión. Solo emite `UserRegisteredEvent` si es nuevo.
  - Test: user nuevo (emite evento, nickname generado), user existente (no emite evento, actualiza avatar).

- [ ] **TASK-AUTH-19** — `GuestProgressMigrator`
  - Itera `guestGames[]`, inserta games + attempts, UPSERT stats, emite `GuestProgressMigratedEvent`.
  - Test: migración completa, idempotencia (mismo gameId no duplica), evento emitido.

---

## Bloque 4 — Infrastructure

> NestJS, TypeORM, Passport. Cubiertos principalmente por tests E2E.

- [ ] **TASK-AUTH-20** — Migración TypeORM `create-identity`
  - Crea tablas `users` y `refresh_tokens` con índices y constraints del spec.
  - Siguiendo el skill `api-migrations`.

- [ ] **TASK-AUTH-21** — Entidades TypeORM `UserEntity` y `RefreshTokenEntity`
  - Solo mapeo DB ↔ objeto plano. Sin lógica. Sufijo `Entity`.
  - En `identity/infrastructure/persistence/`.

- [ ] **TASK-AUTH-22** — `TypeOrmUserRepository`
  - Implementa `UserRepository`. Métodos `toDomain()` y `toEntity()` privados.
  - Mapeo explícito via `User.fromPrimitives()` y `user.toPrimitives()`.

- [ ] **TASK-AUTH-23** — `TypeOrmRefreshTokenRepository`
  - Implementa `RefreshTokenRepository`. Mismo patrón de mapeo.

- [ ] **TASK-AUTH-24** — Payloads con `class-validator`
  - `GuestAuthPostPayload` (vacío — sin body)
  - `RegisterAuthPostPayload`: `email`, `password`, `nickname`, `guestDeviceId?`
  - `LoginAuthPostPayload`: `email`, `password`, `guestDeviceId?`
  - `MigrateGuestAuthPostPayload`: `guestGames[]` con nested validation
  - Cada payload junto a su controller.

- [ ] **TASK-AUTH-25** — Controllers (uno por acción)
  - `GuestAuthPostController` → `POST /auth/guest`
  - `RegisterAuthPostController` → `POST /auth/register`
  - `LoginAuthPostController` → `POST /auth/login`
  - `RefreshAuthPostController` → `POST /auth/refresh`
  - `LogoutAuthPostController` → `POST /auth/logout`
  - `GoogleAuthGetController` → `GET /auth/google`
  - `GoogleCallbackAuthGetController` → `GET /auth/google/callback`
  - `MigrateGuestAuthPostController` → `POST /auth/migrate-guest`
  - Método siempre `handler()`. Sin lógica — delega al use case.

- [ ] **TASK-AUTH-26** — Registro de errors en `GlobalExceptionRegistry`
  - Mapear todos los `DomainError` de este BC a su status HTTP.
  - Siguiendo el skill `api-error-handler`.

- [ ] **TASK-AUTH-27** — `IdentityModule`
  - Registra providers con tokens `Symbol` (`USER_REPOSITORY`, `REFRESH_TOKEN_REPOSITORY`).
  - Importa `SharedModule`, `AuthModule` (guards/strategies), `TypeOrmModule.forFeature(...)`, `JwtModule`, `PassportModule`.
  - Siguiendo los skills `api-di` e `api-infrastructure`.

---

## Bloque 5 — Tests E2E

> Levantan la app completa contra una DB de test. Validan el contrato HTTP real.

- [ ] **TASK-AUTH-28** — E2E: flujo guest
  - `POST /auth/guest` → 200 con `accessToken` + `deviceId`.
  - `POST /auth/refresh` con cookie válida → 200 + rotation.
  - Token expirado → 401.

- [ ] **TASK-AUTH-29** — E2E: registro + login
  - Registro exitoso → 201.
  - Email duplicado → 409. Nickname duplicado → 409. Password débil → 422.
  - Login exitoso → 200. Credenciales incorrectas → 401 (mismo mensaje para email y password).

- [ ] **TASK-AUTH-30** — E2E: refresh + logout
  - Refresh exitoso → 200 + nuevo cookie.
  - Segundo uso del mismo token → 401 + todos los tokens del usuario revocados.
  - Logout → 204 + cookie borrada.
  - Refresh tras logout → 401.

- [ ] **TASK-AUTH-31** — E2E: guards
  - Endpoint protegido sin token → 401.
  - Endpoint de teacher con token `user` → 403.
  - Endpoint con `@Public` sin token → 200.

---

## Orden recomendado

```
Bloque 1 (Shared prereqs)
  → Bloque 2 (Domain) — secuencial según numeración
  → Bloque 3 (Application) — secuencial
  → Bloque 4 (Infrastructure) — TASK-AUTH-20 a 27
  → Bloque 5 (E2E)

GoogleOAuthHandler (TASK-AUTH-18) y GoogleStrategy (TASK-AUTH-03 parcial)
pueden dejarse para el final si querés validar el core de auth primero.
```

---

## Definition of Done

- [ ] Todos los tests unit e integration pasan: `pnpm --filter @ididntcatchthat/api test`
- [ ] Tests E2E pasan: `pnpm --filter @ididntcatchthat/api test:e2e`
- [ ] `pnpm lint` sin errores
- [ ] Migración TypeORM ejecutable sin errores en DB de test
- [ ] Endpoints documentados con `@ApiTags`, `@ApiOperation`, `@ApiResponse` (Swagger)
