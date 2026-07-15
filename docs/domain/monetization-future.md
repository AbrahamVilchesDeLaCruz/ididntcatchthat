# Monetización — qué hay reservado y qué no

> Documento de honestidad sobre el rol `premium`. Está reservado en el modelo de datos pero **no implementado** en el TFM. Cualquier mención a "premium" en el código actual es un placeholder.

---

## Estado actual

| Capa | Estado del `premium` |
|---|---|
| `UserRoleValue` enum (TypeScript) | ❌ **No incluido.** Solo `user`, `teacher`, `admin` — ver [`apps/api/src/identity/user/domain/user-role.ts`](../../apps/api/src/identity/user/domain/user-role.ts). |
| CHECK constraint en DB | ✅ Incluido como valor válido: `CHECK ("role" IN ('user','teacher','admin','premium'))` — ver [`Migration202605230526271779506787479.ts`](../../apps/api/src/shared/infrastructure/persistence/migrations/Migration202605230526271779506787479.ts) línea 15. |
| `UserRole.create()` validación | ❌ **Rechaza** `'premium'` con `UserRoleInvalidException` — la capa de dominio lo bloquea. |
| Lógica de monetización (Stripe, entitlements, paywall) | ❌ No existe. |
| UI que mencione premium / pago | ❌ No hay. |

**Inconsistencia actual:** la DB acepta `'premium'` en el CHECK, pero el dominio no lo deja pasar por el VO. Si alguien insertase manualmente `INSERT INTO users (role) VALUES ('premium')` con un password hash válido, la fila entraría — pero el backend rechazaría cualquier operación posterior porque reconstituiría el aggregate y `UserRole.create('premium')` lanzaría.

Esto **no es un bug** — es una ventana intencional para añadir el valor al enum cuando llegue la monetización, sin necesidad de una migration nueva.

---

## Por qué se reservó

[ADR-018](./adr/018-auth-strategy.md) menciona (línea 66):

> El rol `premium` se añadirá al modelo cuando se implemente la monetización.

Tres razones para incluirlo en el CHECK ahora y no después:

1. **Evita una migration destructiva.** Ampliar un CHECK constraint sin drop es trivial (`ALTER TABLE users DROP CONSTRAINT ... ADD CONSTRAINT ...`). Cambiar el dominio después requiere redeploy coordinado con downtime casi nulo pero inevitable.
2. **Alinea DB y dominio cuando llegue el momento.** El día que se implemente monetization, una sola PR añade `Premium = 'premium'` al enum + `UserRole.create('premium')` deja de tirar. El CHECK ya está listo.
3. **Marca intención.** El reviewer que vea `'premium'` en una migration entiende que el dominio **prevé** monetización. No es un valor huérfano.

---

## Monetización prevista (alcance tentativo — no prometido)

> **Honestidad:** el TFM no implementa pagos. Esta sección describe qué **podría** entrar si el proyecto continúa post-TFM, pero **no** es un compromiso de producto.

### Modelo de tiers

| Tier | Roles equivalentes hoy | Funcionalidad |
|---|---|---|
| Free | `user` | Juego, progreso, ranking, achievements |
| Premium | `premium` (futuro) | Free + (definir — sin claims concretos aún) |

**No hay claims concretos** sobre qué daría Premium. Las opciones discutidas pero no comprometidas:

- Acceso a más módulos / categorías avanzadas (no definidas)
- Estadísticas extendidas (más detalle en `weakest_flashcards`, más histórico)
- Modo estudio sin anuncios (no hay anuncios hoy)
- Generación de audio ilimitada (hoy solo admins pueden regenerar audio)
- DeepSeek para ejemplos personalizados (hoy DeepSeek solo en backoffice)

**Lo que NO está en planes:**
- No hay paywall sobre contenido educativo básico. El TFM enseña fonética — bloquear eso contradice la propuesta de valor.
- No hay "freemium agresivo" (límite de 3 partidas/día para free). La monetización, si llega, sería por valor añadido, no por racionar lo básico.

### Implementación técnica (cuando llegue)

#### 1. Activar el rol en el dominio

```typescript
// apps/api/src/identity/user/domain/user-role.ts
export enum UserRoleValue {
  User = 'user',
  Teacher = 'teacher',
  Admin = 'admin',
  Premium = 'premium', // ← añadir
}
```

Sin migration nueva — el CHECK ya lo permite.

#### 2. Stripe para pagos

- Crear cuenta Stripe + productos (`premium_monthly`, `premium_yearly`).
- Webhook handler `POST /stripe/webhook` para eventos `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
- Tabla `subscriptions` (id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end).
- Al recibir `created`: `UPDATE users SET role = 'premium'` vía use case `UserPromoter`.
- Al recibir `deleted`: `UPDATE users SET role = 'user'` vía use case `UserDemoter`.

**Crítico:** webhooks deben ser idempotentes (Stripe puede entregar el mismo evento dos veces). El patrón `processed_events` del [ADR-019](./adr/019-event-bus-strategy.md) aplica.

#### 3. Entitlement checks en código

Opción A — Voter explícito:

```typescript
// shared/auth/premium-voter.ts
@Injectable()
export class PremiumVoter {
  canActivate(user: UserContext): boolean {
    return user.roles?.includes('premium') ?? false;
  }
}
```

Opción B — método en el aggregate:

```typescript
// identity/user/domain/user.ts
isPremium(): boolean {
  return this._role.value === UserRoleValue.Premium;
}
```

Recomendación: opción B (lógica en el dominio) para chequeos dentro de use cases, opción A para guards de controllers.

#### 4. Frontend — paywall UI

- Página `/premium` con pricing.
- Botón "Hazte Premium" → Stripe Checkout.
- Webhook confirma → query client invalida sesión.
- Banner "Hazte Premium" en features bloqueadas.

#### 5. NO romper lo que ya funciona

- Usuarios existentes con `role = 'user'` siguen siendo `user`. No se les cobra retroactivamente.
- Stripe en modo test primero (`stripe listen --forward-to ...`).
- Feature flags para rollout gradual — no activar para todos el día 1.

---

## Lo que NO debería pasar (anti-patrones)

| Anti-patrón | Por qué evitarlo |
|---|---|
| Añadir paywall sobre fonética básica | Contradice la propuesta de valor del producto |
| Premium-only achievements | El sistema de achievements se diseñó como motivador universal — bloquearlo erosiona engagement |
| Hard-paywall sin trial | Convierte un producto freemium en producto de pago. Frena adquisición |
| Cobrar por "quitar anuncios" sin anuncios | Patrón oscuro |
| Auto-renew sin cancelar fácil | Viola GDPR y normas deconsumer protection |
| Tier premium solo por UI (sin entitlements reales) | "Pay to remove a label" no es monetización real |

---

## Alternativas de monetización consideradas

| Modelo | Viabilidad | Descartado porque... |
|---|---|---|
| **Suscripción mensual** (Stripe) | Alta | El modelo estándar SaaS, encaja con el ciclo de aprendizaje |
| **Compra única de módulos premium** | Media | Complica el modelo — "¿qué módulo compro?" |
| **Anuncios en el juego** | Baja | Contradice la experiencia de aprendizaje concentrado |
| **Pago por generación de audio** (ElevenLabs pasa al usuario) | Media | Caro para el usuario + DeepSeek ya es nuestra elección barata |
| **Donaciones / Buy me a coffee** | Baja | No escala |
| **Licencia B2B a escuelas** | Alta a largo plazo | Requiere producto multi-tenant — fuera del alcance del TFM |

Para el TFM se mantiene **sin monetización**. La decisión se documenta aquí para que el siguiente paso sea deliberado, no accidental.

---

## Referencias

- [ADR-018 — Estrategia de autenticación](./adr/018-auth-strategy.md) (menciona la reserva del rol)
- [`apps/api/src/identity/user/domain/user-role.ts`](../../apps/api/src/identity/user/domain/user-role.ts)
- [`Migration202605230526271779506787479.ts`](../../apps/api/src/shared/infrastructure/persistence/migrations/Migration202605230526271779506787479.ts)
- [ADR-019 — Event bus](./adr/019-event-bus-strategy.md) (patrón `processed_events` para idempotencia de webhooks)
- [feature-flags-and-stubs.md](./engineering/feature-flags-and-stubs.md) — convención para stubs (este doc es un stub documentado)