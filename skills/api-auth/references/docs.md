# api-auth — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-infrastructure` | Controllers que usan `@UseGuards` y `@CurrentUser` |
| `api-shared` | `SharedModule` donde se registra `AuthModule` |
| `api-di` | Cómo registrar strategies y guards en el módulo |
| `api-application` | Use cases que reciben `UserContext` como parámetro |

## Architectural Decision

- ADR 018: [docs/adr/018-auth-strategy.md](../../docs/adr/018-auth-strategy.md)

## External Documentation

- [NestJS — Authentication](https://docs.nestjs.com/security/authentication) — Passport integration, JWT, Guards
- [NestJS — Authorization](https://docs.nestjs.com/security/authorization) — RBAC, Claims-based
- [Passport.js — Strategies](https://www.passportjs.org/packages/) — jwt, google, local
- [jsonwebtoken — npm](https://www.npmjs.com/package/jsonwebtoken) — JWT sign/verify
- [Google OAuth2 — Developers](https://developers.google.com/identity/protocols/oauth2) — scopes, flows

## Token Security Notes

| Token | Storage | Expiry | Transport |
|---|---|---|---|
| Access token | In-memory (client) | 15 min | `Authorization: Bearer` header |
| Refresh token | `httpOnly` cookie | 30 days | Cookie — `Secure`, `SameSite=Strict` |
| Guest token | In-memory (client) | 30 days | `Authorization: Bearer` header |

Never store access tokens in `localStorage` — XSS vectors can read them.
