# Auth Strategies & Guards — Reference

## JWT Strategy

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

## Guest Strategy

```typescript
// shared/infrastructure/auth/guest.strategy.ts
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, "guest") {
  constructor() {
    super();
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

## Guards

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
    const request = context.switchToHttp().getRequest();
    return !!request.user;
  }
}
```

## @CurrentUser — decorator de parámetro

```typescript
// shared/infrastructure/auth/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Flujo guest → registered (token swap)

```typescript
// auth/application/register/user-registerer.ts
async execute(guestContext: UserContext, email: string, password: string): Promise<TokenPair> {
  const user = User.create(email, password, guestContext.deviceId);
  await this.repository.save(user);

  return this.tokenService.generate({
    type: 'registered',
    deviceId: guestContext.deviceId, // mismo deviceId — trazabilidad continua
    userId: user.id.value,
    email,
    roles: ['user'],
  });
}
```

## Estructura de archivos

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
└── auth.module.ts

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
    ├── framework/auth.module.ts
    └── persistence/typeorm-refresh-token.repository.ts
```
