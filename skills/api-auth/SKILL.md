---
name: api-auth
description: "Convenciones de autenticación en la API: JWT (access + refresh), OAuth Google, token guest, guards, strategies y CurrentUser. Trigger: Al implementar auth, guards, strategies de Passport, decorator @CurrentUser, o voters en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al proteger un endpoint con guard
- Al implementar una strategy de Passport (JWT, Google, Guest)
- Al acceder al usuario actual en un controller (`@CurrentUser`)
- Al aplicar permisos de ownership o role

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/strategies.md` para las implementaciones completas de strategies, guards, `@CurrentUser`, flujo guest→registered y estructura de archivos.

---

## UserContext — tipo compartido

```typescript
// shared/domain/user-context.ts
export type UserType = 'guest' | 'user' | 'teacher' | 'admin';

export type UserContext = {
  type: UserType;
  deviceId: string;    // UUID generado por el backend — no falsificable
  fingerprint?: string; // hash(userAgent + acceptLanguage + ip) — opcional
  ip: string;
  userId?: string;     // solo user / teacher / admin
  email?: string;      // solo user / teacher / admin
  roles?: string[];    // solo user / teacher / admin
};
```

---

## Uso de guards en controllers

```typescript
@UseGuards(JwtAuthGuard)                          // solo usuarios registrados (type: user/teacher/admin)
@UseGuards(GuestAuthGuard)                        // solo guests
@UseGuards(AnyAuthGuard)                          // registrado o guest (acepta ambos tokens)
@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')  // admin
// Sin guard → endpoint público. Usa @Public() para dejar constancia explícita
@Public()
```

```typescript
async handler(
  @CurrentUser() user: UserContext,
): Promise<void> {
  await this.useCase.execute({ userId: user.userId });
}
```

---

## Permisos — dónde va cada tipo

| Tipo de permiso | Dónde | Cómo |
|---|---|---|
| Acceso al endpoint | Controller | `@UseGuards()` |
| Ownership / filtrar mis recursos | Controller | Añade `userId` al criteria |
| Role check simple | Controller | `@UseGuards(RolesGuard)` + `@Roles('admin')` |
| Lógica de negocio con permisos | Use Case | Recibe `UserContext`, decide con reglas de dominio |

**Ownership en controller:**

```typescript
@Get()
@UseGuards(JwtAuthGuard)
async handler(@Query() query: SearchFlashcardsGetQuery, @CurrentUser() user: UserContext) {
  const filters = [
    ...query.filters ?? [],
    { field: 'userId', operator: '=', value: user.userId },
  ];
  return this.searcher.execute(filters);
}
```

**Permiso de negocio en use case:**

```typescript
// El use case recibe userId del Request* (construido por el controller con user.userId)
async execute(request: RequestFlashcardPublisher): Promise<void> {
  const flashcard = await this.finder.findOrFail(new FlashcardId(request.id));
  if (flashcard.ownerId.value !== request.userId) {
    throw new FlashcardPublishNotAllowed(request.id);
  }
  flashcard.publish();
  await this.repository.save(flashcard);
}
```

---

## Token strategy

- **Access token**: 15min — `Authorization: Bearer` — en memoria del cliente (no `localStorage`)
- **Refresh token**: 30 días — cookie `httpOnly`, `Secure`, `SameSite=Strict`
- **`deviceId`**: generado por el backend — nunca confiado del cliente
- **Guest→registered**: mismo `deviceId` — trazabilidad continua

---

## Anti-patterns

```typescript
// ❌ Access token en localStorage
localStorage.setItem('token', accessToken);

// ❌ deviceId del cliente sin verificar
const deviceId = req.headers['x-device-id'];

// ❌ Ownership check en use case cuando es solo un filtro
const all = await this.repository.match(...);
return all.filter(f => f.userId === userId); // va en controller con criteria

// ❌ Lógica de permisos de negocio en controller
if (user.roles.includes('admin') && flashcard.status === 'draft') { ... }
```

---

> ADR: [docs/adr/018-auth-strategy.md](../../docs/adr/018-auth-strategy.md)
