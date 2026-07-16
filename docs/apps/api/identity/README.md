# Identity BC

## Estructura

```
identity/
├── user/       ← User aggregate, streak, stats, ranking profile, OAuth
├── session/    ← UserSession, guest/refresh/logout
└── shared/     ← JWT, bcrypt, IdentityModule, exception registry
```

## Endpoints

> Rutas OAuth (`GET /auth/google*`) sin prefijo `/v1` — excluidas del global prefix en `main.ts`. Resto de auth: `/v1/auth/*`.

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| `POST` | `/auth/guest` | — | `{ accessToken, deviceId }` (sin envelope — contrato auth) |
| `POST` | `/auth/register` | — | `{ accessToken }` + cookie refresh |
| `POST` | `/auth/login` | — | `{ accessToken }` + cookie refresh |
| `POST` | `/auth/refresh` | Cookie | `{ accessToken }` |
| `POST` | `/auth/logout` | JWT | 204 void |
| `GET` | `/auth/google` | — | redirect OAuth |
| `GET` | `/auth/google/callback` | Google | redirect + cookie refresh |
| `POST` | `/auth/migrate-guest` | JWT | 204 void |
| `GET` | `/users/me/ranking-profile` | JWT | envelope |
| `PATCH` | `/users/me/ranking-profile` | JWT | envelope |
| `GET` | `/users/stats?period=` | JWT admin | envelope |

## Eventos publicados

| Evento | Exchange | Cuándo |
|--------|----------|--------|
| `UserRegistered` | `ididntcatchthat.identity.user.registered` | Registro email u OAuth nuevo |
| `StreakUpdated` | `ididntcatchthat.identity.streak.updated` | Primera actividad del día |
| `StreakBroken` | `ididntcatchthat.identity.streak.broken` | Cron detecta racha rota |
| `RankingProfileUpdated` | `ididntcatchthat.identity.user.ranking_profile_updated` | PATCH ranking profile |
| `GuestProgressMigrated` | `ididntcatchthat.identity.user.guest_progress_migrated` | Migrate guest tras registro |
| `SessionStarted` | `ididntcatchthat.identity.session.started` | Login / register / OAuth / guest |
| `SessionRevoked` | `ididntcatchthat.identity.session.revoked` | Logout |
| `SessionRotated` | `ididntcatchthat.identity.session.rotated` | Refresh token |
| `SessionCompromised` | `ididntcatchthat.identity.session.compromised` | Reuse detection |

## Eventos consumidos

| Evento | Handler | Cola | Efecto |
|--------|---------|------|--------|
| `GameCompleted` | `StreakUpdaterOnGameCompleted` | `identity.update_streak_on_game_completed` | Incrementa streak si primera actividad del día |
| `FlashcardViewed` | `StreakUpdaterOnFlashcardViewed` | `identity.update_streak_on_flashcard_viewed` | Incrementa streak en study (userId no null) |

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `users` | Agregado User (incl. streak, ranking prefs) |
| `user_sessions` | Refresh tokens por dispositivo |

### Pipeline async (streak)

```
GameCompleted (Gaming) ─► StreakUpdaterOnGameCompleted ─► User.recordActivity()
FlashcardViewed (Gaming) ─► StreakUpdaterOnFlashcardViewed ─► User.recordActivity()
                                                                          └─► StreakUpdated (si first activity del día)
                                                                          └─► StreakBroken (si cron detecta racha rota)
                                                                          └─► UnlockUserAchievementOnStreakUpdated (Achievement)
                                                                          └─► RankingUpdaterOnStreakUpdated (Ranking)
```

`StreakBrokenCronJob` corre diariamente y publica `StreakBroken` cuando detecta que la racha del día anterior no se cerró.

## Cross-BC

| Dependencia | Mecanismo |
|-------------|-----------|
| Ranking sync | `RankingProfileUpdated` → `RankingUpdaterOnRankingProfileUpdated` |
| Gaming guest games | `GuestProgressMigrated` → `MigrateGuestGamesOnGuestProgressMigrated` |
| Progress guest stats | `GuestProgressMigrated` → `GuestProgressImporterOnGuestProgressMigrated` |
| Achievement streak | `StreakUpdated` → `UnlockUserAchievementOnStreakUpdated` |
| Ranking streak | `StreakUpdated` → `RankingUpdaterOnStreakUpdated` |
| Gaming activity (admin stats) | Read port `UserGamesCompletedQuery` exportado por GamingModule |

## Paridad

- **ADR-018** define el modelo de auth (JWT access + refresh + OAuth Google + guest) y los eventos de sesión.
- **Session compromised** (`SessionCompromisedEvent`) se publica cuando `TokenRefresher` detecta reuso del refresh token — actualmente log + revoke en cascada, sin consumer BC.
- **Guest → user**: `MigrateGuestAuthenticator` es idempotente: si el `deviceId` ya está asociado a un usuario, no vuelve a publicar `GuestProgressMigrated`. `GuestProgressMigrator` solo migra partidas con `userId IS NULL`.
- **Eligibility para ranking**: `RankingEligibilityQuery.findEligibleUser` cruza `users.show_in_ranking` con el `userId` y delega en `IdentityRankingProfileAdapter` (Ranking). Misma fuente para ACL.

## Referencias

- [Flujos de auth](./guest/) — guest, register, login, refresh, logout, OAuth, migrate-guest
- [Ranking Profile](./ranking-profile/) — GET/PATCH `/users/me/ranking-profile`
- [User Stats](./user-stats/) — GET `/users/stats?period=`
- [Spec de autenticación](../../../spec/auth.md)
- [Bounded contexts](../../../domain/bounded-contexts.md)

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Guest](./guest/) | `POST /auth/guest` | [Clases](./guest/classes.md) · [Secuencia](./guest/sequence.md) · [Casos de uso](./guest/usecases.md) |
| [Register](./register/) | `POST /auth/register` | [Clases](./register/classes.md) · [Secuencia](./register/sequence.md) · [Casos de uso](./register/usecases.md) |
| [Login](./login/) | `POST /auth/login` | [Clases](./login/classes.md) · [Secuencia](./login/sequence.md) · [Casos de uso](./login/usecases.md) |
| [Refresh](./refresh/) | `POST /auth/refresh` | [Clases](./refresh/classes.md) · [Secuencia](./refresh/sequence.md) · [Casos de uso](./refresh/usecases.md) |
| [Logout](./logout/) | `POST /auth/logout` | [Clases](./logout/classes.md) · [Secuencia](./logout/sequence.md) · [Casos de uso](./logout/usecases.md) |
| [Google OAuth](./google-oauth/) | `GET /auth/google`, callback | [Clases](./google-oauth/classes.md) · [Secuencia](./google-oauth/sequence.md) · [Casos de uso](./google-oauth/usecases.md) |
| [Migrate Guest](./migrate-guest/) | `POST /auth/migrate-guest` | [Clases](./migrate-guest/classes.md) · [Secuencia](./migrate-guest/sequence.md) · [Casos de uso](./migrate-guest/usecases.md) |
| [Ranking Profile](./ranking-profile/) | GET/PATCH ranking profile | [Clases](./ranking-profile/classes.md) · [Secuencia](./ranking-profile/sequence.md) · [Casos de uso](./ranking-profile/usecases.md) |
| [User Stats](./user-stats/) | `GET /users/stats?period=` | [Clases](./user-stats/classes.md) · [Secuencia](./user-stats/sequence.md) · [Casos de uso](./user-stats/usecases.md) |
