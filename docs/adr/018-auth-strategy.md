# ADR 018 — Estrategia de Autenticación

**Estado**: Aceptado  
**Fecha**: 2026-05-21  
**Autores**: Abraham Vilches de la Cruz

---

## Contexto

La plataforma ididntcatchthat tiene tres tipos de usuarios:

1. **Guest** — accede sin registro. Puede jugar pero con funcionalidades limitadas.
2. **Registered** — usuario registrado con email/password o OAuth.
3. **Admin** — gestión de contenido (backoffice).

Necesitamos una estrategia de auth que:
- Permita acceso guest sin fricción (sin registro)
- Soporte OAuth con Google
- Permita rastrear guests para rate limiting y detección de abuso (sin identidad)
- Funcione en browser y potencialmente mobile en el futuro
- Sea stateless — el VPS no tiene Redis ni almacenamiento de sesiones

---

## Decisión

**JWT con access token de vida corta + refresh token en cookie httpOnly.**

### Tokens

| Token | Dónde | TTL | Contenido |
|---|---|---|---|
| Access token | `Authorization: Bearer` header | **15 minutos** | `userId?`, `deviceId`, `ip`, `type: guest\|registered\|admin` |
| Refresh token | Cookie `httpOnly`, `Secure`, `SameSite=Strict` | 30 días | `tokenId` (referencia a DB) |

### Tipos de token por flujo

**Guest:**
```json
{
  "type": "guest",
  "deviceId": "uuid-generado-por-backend",
  "fingerprint": "hash(userAgent + acceptLanguage + ip)",
  "ip": "1.2.3.4"
}
```

**Registered:**
```json
{
  "type": "registered",
  "userId": "uuid",
  "deviceId": "uuid",
  "email": "user@example.com",
  "roles": ["user"]
}
```

### Flujos

**Guest:**
```
POST /auth/guest
  → backend genera deviceId + firma JWT access (15min) + JWT refresh (30d en cookie)
  → cliente guarda access token en memoria (no localStorage)
  → en cada request: Authorization: Bearer <access_token>
  → al expirar: POST /auth/refresh → nuevo access token
```

**Registro / Login:**
```
POST /auth/register  o  POST /auth/login
  → verifica credenciales
  → devuelve access token + refresh token en cookie
  → si era guest: mantiene el mismo deviceId (token swap)
```

**OAuth Google:**
```
GET  /auth/google          → redirect a Google
GET  /auth/google/callback → Google devuelve code
                           → backend intercambia por profile
                           → crea/busca user en DB
                           → devuelve access token + refresh token en cookie
```

**Refresh:**
```
POST /auth/refresh
  → lee refresh token de cookie httpOnly
  → verifica en DB que no esté revocado
  → devuelve nuevo access token (rotation)
```

**Logout:**
```
POST /auth/logout
  → revoca refresh token en DB
  → borra cookie
```

---

## Alternativas consideradas

### Sessions server-side
**Rechazado** — requiere Redis para estado compartido entre instancias. Stateful, complejidad innecesaria para un VPS simple.

### Cookies httpOnly para access token
**Rechazado** — CORS con cookies es complejo (SameSite, dominios cruzados). El guest token con deviceId se complica porque las cookies las manda el browser automáticamente sin control explícito del cliente.

### JWT sin refresh (access de larga duración)
**Rechazado** — si el token se compromete, es válido durante días. Sin mecanismo de revocación.

### JWT en localStorage
**Rechazado** — vulnerable a XSS. El access token va en memoria JS (variable), el refresh en cookie httpOnly.

---

## Consecuencias

**Positivas:**
- Stateless — el servidor no guarda sesiones
- Funciona en browser y mobile sin cambios
- OAuth con Google devuelve JWT — flujo natural
- Guest→registered es un token swap transparente para el cliente
- Refresh en cookie httpOnly — no accesible por JS, protegido contra XSS
- `deviceId` firmado por el backend — no falsificable, útil para rate limiting

**Negativas / trade-offs:**
- Access token de 15min requiere lógica de refresh en el cliente
- Refresh tokens necesitan tabla en DB para revocación (logout, sesiones múltiples)
- Rotation de refresh tokens añade complejidad (si el token se usa dos veces → sesión comprometida)

---

## Referencias

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- Skill de implementación: [skills/api-auth/SKILL.md](../../skills/api-auth/SKILL.md)
