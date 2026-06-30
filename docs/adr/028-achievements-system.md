# ADR-028: Sistema de logros v2

**Fecha**: 2026-06-30  
**Estado**: Aceptado  
**Contexto**: Rediseño integral de achievements (profile, catálogo, eventos, toasts)

---

## Contexto

Los logros v1 vivían al final de `/stats` con emojis genéricos. El catálogo estaba duplicado (código + DB) con copy en inglés en la API. Los desbloqueos eran silenciosos (sin evento de dominio ni toast). `cards_100` contaba intentos de estudio además de juego.

---

## Decisiones

### 1. Galería en `/profile`, no en `/stats`

`/stats` = KPIs accionables (rachas, módulos, débiles).  
`/profile` = identidad gamificada (ranking, preferencias, **logros**).

### 2. Contrato API estructural + i18n en cliente

`GET /achievements` devuelve `key`, `category`, `sortOrder`, `unlockedAt`. Títulos y descripciones viven en i18n del cliente (`achievements.items.{key}`).

### 3. Catálogo en dominio como fuente de verdad

`ACHIEVEMENT_CATALOG` en código define keys, categorías y orden. La tabla `achievement_catalog` mantiene FK integrity vía migración idempotente.

### 4. Evento `AchievementUnlocked`

Al desbloquear, `AchievementUnlocker` publica `AchievementUnlockedEvent` para futuro Notification BC y observabilidad. Cola documentada en RabbitMQ design.

### 5. Toast async con poll

Los unlocks ocurren vía RabbitMQ tras `GameCompleted`. El cliente no recibe logros en la respuesta síncrona de complete; usa poll `?since` con retry corto + invalidación de query cache.

### 6. Iconos Lucide por categoría

Cuatro iconos de categoría (no SVG custom por logro) — coherente con el resto de la UI.

---

## Consecuencias

- Breaking change en API (sin `title`/`description`) — aceptable en TFM, cliente migrado en el mismo PR
- `/stats` deja de mostrar logros; copy de home y guest panel actualizado
- Categoría `pronunciation` reservada en docs sin implementación

---

## Referencias

- [docs/spec/achievements.md](../spec/achievements.md)
- [docs/apps/api/achievement/README.md](../apps/api/achievement/README.md)
