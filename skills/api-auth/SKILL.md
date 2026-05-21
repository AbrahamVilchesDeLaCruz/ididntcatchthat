---
name: api-auth
description: >
  Convenciones de autenticación en la API: JWT (access + refresh), OAuth Google, token guest, guards, strategies y CurrentUser.
  Trigger: Al implementar auth, guards, strategies de Passport, decorator @CurrentUser, o voters en apps/api/.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al proteger un endpoint con guard
- Al implementar una strategy de Passport (JWT, Google, Guest)
- Al acceder al usuario actual en un controller (`@CurrentUser`)
- Al aplicar permisos de ownership o role en controller o use case

## Critical Patterns

### UserContext — tipo compartido

```typescript
// shared/domain/user-context.ts
export type UserType = "guest" | "registered" | "admin";

export type UserContext = {
  type: UserType;
  deviceId: string; // UUID generado por el backend en el primer request — no falsificable
  fingerprint: string; // hash(userAgent + acceptLanguage + ip) — metadata del dispositivo
  ip: string;
  userId?: string; // solo registered / admin
  email?: string; // solo registered / admin
  roles?: string[]; // solo registered / admin
};
```

### Strategies de Passport

Una strategy por mecanismo de auth. Viven en `shared/infrastructure/auth/`.

```typescript
// shared/infrastructure/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: UserContext): UserContext {
    return payload; // se adjunta a request.user
  }
}
```

```typescript
// shared/infrastructure/auth/guest.strategy.ts
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, "guest") {
  validate(payload: UserContext): UserContext {
    return payload; // type: 'guest' — sin userId
  }
}
```

```typescript
// shared/infrastructure/auth/google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): UserContext {
    return {
      type: "registered",
      deviceId: crypto.randomUUID(),
      ip: "",
      userId: profile.id,
      email: profile.emails?.[0].value,
      roles: ["user"],
    };
  }
}
```

### Guards

Un guard por strategy. Se combinan con `@UseGuards()`.

```typescript
// shared/infrastructure/auth/jwt.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

// shared/infrastructure/auth/guest.guard.ts
@Injectable()
export class GuestAuthGuard extends AuthGuard("guest") {}

// Guard que acepta JWT registrado O guest
@Injectable()
export class AnyAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // intenta JWT primero, luego guest
    const request = context.switchToHttp().getRequest();
    return !!request.user;
  }
}
```

### @CurrentUser — decorator de parámetro

```typescript
// shared/infrastructure/auth/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Uso en controller:

```typescript
@Get(':id')
@UseGuards(JwtAuthGuard)
async handler(
  @Param('id') id: string,
  @CurrentUser() user: UserContext,
): Promise<FlashcardPrimitives> {
  return this.finder.execute(id, user);
}
```

### Permisos — dónde va cada tipo

| Tipo de permiso                                          | Dónde      | Cómo                                                   |
| -------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| Acceso al endpoint                                       | Controller | `@UseGuards()`                                         |
| Ownership en filtros (ver solo mis recursos)             | Controller | Añade `userId` al criteria antes de llamar al use case |
| Role check simple                                        | Controller | `@UseGuards(RolesGuard)` + `@Roles('admin')`           |
| Lógica de negocio con permisos (¿puede publicar evento?) | Use Case   | Recibe `UserContext`, decide con reglas de dominio     |

**Ownership en controller:**

```typescript
@Get()
@UseGuards(JwtAuthGuard)
async handler(
  @Query() query: SearchFlashcardsGetQuery,
  @CurrentUser() user: UserContext,
): Promise<FlashcardPrimitives[]> {
  // el controller añade el filtro de ownership — el use case no sabe de users
  const filters = [
    ...query.filters ?? [],
    { field: 'userId', operator: '=', value: user.userId },
  ];
  return this.searcher.execute(filters, ...);
}
```

**Permiso de negocio en use case:**

```typescript
// flashcards/application/publish/flashcard-publisher.ts
async execute(id: string, actor: UserContext): Promise<void> {
  const flashcard = await this.finder.find(new FlashcardId(id));

  if (flashcard.ownerId.value !== actor.userId) {
    throw new FlashcardPublishNotAllowed(id);
  }

  flashcard.publish();
  await this.repository.save(flashcard);
}
```

### Flujo guest → registered (token swap)

```typescript
// auth/application/register/user-registerer.ts
async execute(guestContext: UserContext, email: string, password: string): Promise<TokenPair> {
  const user = User.create(email, password, guestContext.deviceId);
  await this.repository.save(user);

  // mismo deviceId del guest — trazabilidad continua
  return this.tokenService.generate({
    type: 'registered',
    deviceId: guestContext.deviceId,
    userId: user.id.value,
    email,
    roles: ['user'],
  });
}
```

### Estructura de archivos

```
shared/infrastructure/auth/
├── jwt.strategy.ts
├── jwt.guard.ts
├── guest.strategy.ts
├── guest.guard.ts
├── google.strategy.ts
├── google.guard.ts
├── any-auth.guard.ts
├── roles.guard.ts
├── current-user.decorator.ts
└── auth.module.ts         ← exporta todos los guards y strategies

auth/
├── domain/
│   ├── refresh-token.ts
│   └── refresh-token.repository.ts
├── application/
│   ├── guest/guest-authenticator.ts
│   ├── register/user-registerer.ts
│   ├── login/user-logger.ts
│   ├── refresh/token-refresher.ts
│   └── logout/user-logouter.ts
└── infrastructure/
    ├── controllers/
    │   ├── guest-auth-post.controller.ts
    │   ├── login-auth-post.controller.ts
    │   ├── register-auth-post.controller.ts
    │   ├── refresh-auth-post.controller.ts
    │   ├── logout-auth-post.controller.ts
    │   ├── google-auth-get.controller.ts
    │   └── google-callback-auth-get.controller.ts
    ├── framework/
    │   └── auth.module.ts
    └── persistence/
        └── typeorm-refresh-token.repository.ts
```

## Reglas

- Access token: 15min — en `Authorization: Bearer` header, en memoria del cliente (no localStorage)
- Refresh token: 30 días — en cookie `httpOnly`, `Secure`, `SameSite=Strict`
- `deviceId` siempre generado por el backend — nunca confiado del cliente
- Guest→registered: mismo `deviceId` — trazabilidad continua
- Ownership check: en controller, añadiendo filtros al criteria
- Permisos de negocio: en use case, recibiendo `UserContext` como parámetro

## Anti-patterns

```typescript
// ❌ Access token en localStorage
localStorage.setItem('token', accessToken);

// ❌ deviceId del cliente sin verificar
const deviceId = req.headers['x-device-id']; // falsificable

// ❌ Ownership check en use case cuando es solo un filtro
async execute(id: string, userId: string): Promise<void> {
  const all = await this.repository.match(...);
  return all.filter(f => f.userId === userId); // esto va en el controller con criteria
}

// ❌ Lógica de negocio con permisos en controller
if (user.roles.includes('admin') && flashcard.status === 'draft') { ... } // va en use case
```

## Referencias

- ADR: [docs/adr/001-auth-strategy.md](../../docs/adr/001-auth-strategy.md)
