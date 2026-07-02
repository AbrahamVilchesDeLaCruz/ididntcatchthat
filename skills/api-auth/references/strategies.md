# Auth Strategies & Guards — Reference

## JWT Strategy

Valida el access token Bearer. Lee el secret via `ConfigService` (nunca `process.env` directo).

```typescript
// shared/infrastructure/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: UserContext): UserContext {
    return payload; // se adjunta a request.user
  }
}
```

## Guest Strategy

Misma estructura que `JwtStrategy` — también valida un JWT Bearer, pero registrada con el
nombre `'guest'`. Los tokens guest y user comparten el mismo secret; el campo `type` del
payload los distingue.

```typescript
// shared/infrastructure/auth/guest.strategy.ts
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: UserContext): UserContext {
    return payload; // type: 'guest' — sin userId
  }
}
```

## Google Strategy

```typescript
// shared/infrastructure/auth/google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!, // desde env, no hardcoded
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): UserContext {
    return {
      type: 'user',           // ← 'user', no 'registered'
      deviceId: crypto.randomUUID(),
      fingerprint: '',        // fingerprint no disponible en OAuth callback
      ip: '',
      userId: profile.id,
      email: profile.emails?.[0]?.value,
      roles: ['user'],
    };
  }
}
```

## Guards

```typescript
// shared/infrastructure/auth/jwt.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// shared/infrastructure/auth/guest.guard.ts
@Injectable()
export class GuestAuthGuard extends AuthGuard('guest') {}

// shared/infrastructure/auth/any-auth.guard.ts
// Acepta JWT registrado O guest — NestJS intenta ambas strategies en orden
@Injectable()
export class AnyAuthGuard extends AuthGuard(['jwt', 'guest']) {}

// shared/infrastructure/auth/roles.guard.ts — solo con JwtAuthGuard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    return roles.some(r => user.roles?.includes(r));
  }
}
```

## @Public — decorator para endpoints sin autenticación

```typescript
// shared/infrastructure/auth/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_PUBLIC_KEY, true);
```

Úsalo en endpoints que no requieren ningún token. Deja constancia explícita de que el endpoint
es público en lugar de simplemente no poner guard.

## @CurrentUser — decorator de parámetro

```typescript
// shared/infrastructure/auth/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    return request.user;
  },
);
```

## @Roles — decorator de metadatos

```typescript
// shared/infrastructure/auth/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

## Flujo guest → registered (token swap)

El `deviceId` se mantiene entre guest y registered — es la clave de trazabilidad.

1. Guest llama a `POST /auth/guest` → backend genera `deviceId` con `crypto.randomUUID()` y lo incluye en el token
2. Guest se registra/hace login → el use case recibe el `guestContext.deviceId` y lo propaga al nuevo token
3. El cliente descarta el guest token y usa el nuevo access token

El `deviceId` **siempre lo genera el backend**. Nunca se acepta del cliente.

## Estructura de archivos del BC identity

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
├── roles.decorator.ts
├── public.decorator.ts
├── current-user.decorator.ts
└── auth.module.ts

identity/                         ← BC de identidad (submódulos)
├── session/                      ← agregado Session (refresh tokens)
│   ├── domain/
│   ├── application/
│   │   ├── authenticate/guest-authenticator.ts
│   │   ├── refresh/token-refresher.ts
│   │   └── logout/session-revoker.ts
│   └── infrastructure/
│       ├── controllers/
│       └── persistence/
├── user/                         ← agregado User
│   ├── application/
│   │   ├── authenticate/oauth-authenticator.ts
│   │   ├── login/user-authenticator.ts
│   │   ├── register/user-registrar.ts
│   │   └── migrate-guest/guest-progress-migrator.ts
│   └── infrastructure/
└── shared/                       ← wiring NestJS del BC identity
    └── infrastructure/
        └── framework/identity.module.ts
```
