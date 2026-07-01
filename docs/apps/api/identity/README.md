# Identity BC

## Estructura

```
identity/
├── user/       ← User aggregate, streak, stats, ranking profile, OAuth
├── session/    ← UserSession, guest/refresh/logout
└── shared/     ← JWT, bcrypt, IdentityModule, exception registry
```

## Endpoints

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| `POST` | `/auth/guest` | — | `{ accessToken, deviceId }` (sin envelope — contrato auth) |
| `POST` | `/auth/register` | — | `{ accessToken }` + cookie refresh |
| `POST` | `/auth/login` | — | `{ accessToken }` + cookie refresh |
| `POST` | `/auth/refresh` | Cookie | `{ accessToken }` |
| `POST` | `/auth/logout` | JWT | 204 void |
| `GET` | `/auth/google` | — | redirect OAuth |
| `GET` | `/auth/google/callback` | Google | redirect + cookie |
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
| `SessionStarted` | `ididntcatchthat.identity.session.started` | Login / register / OAuth |
| `SessionRevoked` | `ididntcatchthat.identity.session.revoked` | Logout |
| `SessionRotated` | `ididntcatchthat.identity.session.rotated` | Refresh token |
| `SessionCompromised` | `ididntcatchthat.identity.session.compromised` | Reuse detection |

## Eventos consumidos

| Evento | Handler | Efecto |
|--------|---------|--------|
| `GameCompleted` | `StreakUpdaterOnGameCompleted` | Incrementa streak si primera actividad del día |

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `users` | Agregado User (incl. streak, ranking prefs) |
| `user_sessions` | Refresh tokens por dispositivo |

## Cross-BC

| Dependencia | Mecanismo |
|-------------|-----------|
| Ranking sync | `RankingProfileUpdated` → `UpdateRankingOnRankingProfileUpdated` |
| Gaming guest games | `GuestProgressMigrated` → `MigrateGuestGamesOnGuestProgressMigrated` |
| Progress guest stats | `GuestProgressMigrated` → `GuestProgressImporterOnGuestProgressMigrated` |
| Gaming stats (admin) | SQL read en `TypeOrmUserStatsQuery` (`games` join) — deuda conocida |

## Referencias

- [Flujos de auth](./guest/) — guest, register, login, refresh, logout, OAuth, migrate-guest
- [Spec de autenticación](../../../spec/auth.md)
- [Bounded contexts](../../../domain/bounded-contexts.md)
