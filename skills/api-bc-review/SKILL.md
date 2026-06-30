---
name: api-bc-review
description: >
  Proceso de revisión y refactor de bounded contexts en apps/api/: límites DDD, submódulos,
  alineación con skills y checklist de deuda. Trigger: Al auditar un BC existente, dividir
  agregados en submódulos, o evaluar si un concepto merece BC propio.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al auditar un bounded context existente (como hicimos con `achievement`)
- Antes de crear un BC nuevo — decidir si es BC propio, submódulo de otro, o shared
- Cuando un BC crece y mezcla varios agregados sin límites claros
- Tras un rediseño de dominio (catálogo dinámico, nuevos eventos, backoffice)

**No sustituye** las skills de capa (`api-domain`, `api-application`, etc.) — las **orquesta** en orden.

---

## Fase 1 — ¿Merece bounded context propio?

Responder estas preguntas en lenguaje de negocio:

| Pregunta | Si sí → |
|----------|---------|
| ¿Tiene lenguaje ubicuo propio distinto de User/Identity? | BC separado |
| ¿Su ciclo de vida evoluciona independiente (catálogo, reglas, desbloqueos)? | BC separado |
| ¿Solo se muestra en perfil/UI de otro módulo? | **No** implica submódulo — es presentación |
| ¿Es proyección de eventos de otros BCs (como Ranking)? | BC consumer/proyector válido |
| ¿Referencia `userId` sin ser propiedad del agregado User? | Referencia por ID, no mover a Identity |

**Regla:** si añadir una feature nueva solo toca el BC dueño (+ emisor del evento), el límite está bien.

---

## Fase 2 — ¿Un BC o submódulos DDD?

Si el BC tiene **múltiples agregados cohesivos**, dividir:

```
apps/api/src/{bc}/
├── {module-a}/     ← dueño agregado A
├── {module-b}/     ← dueño agregado B
└── shared/         ← VOs cross-módulo + NestJS module + exception registry
```

Ver `apps/api/AGENTS.md` → *Módulos DDD dentro de un Bounded Context*.

Ejemplo `achievement`:
- `catalog/` — definiciones de logros (catálogo, reglas de unlock)
- `progress/` — agregado `UserAchievementProgress` (contadores, módulos tocados)
- `user-achievement/` — desbloqueos por usuario
- `shared/` — `AchievementKey`, `AchievementCategory`, `AchievementModule`

**Prohibido:** capas sueltas (`domain/`, `application/`) en la raíz del BC cuando hay submódulos.

---

## Fase 3 — Checklist de alineación por capa

Usar como tabla de auditoría. Cargar la skill indicada antes de corregir cada fila.

| Área | Skill | Qué verificar |
|------|-------|---------------|
| Aggregate + VOs | `api-domain` | `AggregateRoot`, `fromPrimitives`/`toPrimitives`, VOs sin sufijo |
| Domain errors | `api-domain`, `api-error-handler` | `{Entidad}{Problema}`, registry en `shared/infrastructure/framework/` |
| Repository | `api-domain` | Contrato `match/search/save/remove`, `toDomain`/`toEntity` |
| Use cases | `api-application` | `{Entidad}{Verbo}`, método `execute()`, primitivos in/out |
| Domain services | `api-application`, `api-domain` | En `domain/`, **sin sufijo `Service`** en clase/archivo |
| Subscribers | `api-events` | Junto al use case, `on()` solo delega, queue naming |
| Eventos | `api-domain-events` | `record()` en aggregate, `pullDomainEvents()` tras `save()` |
| Controllers query | `api-response`, `api-rest` | `ApiResponse.of()` / `PaginatedApiResponse.of()` con `meta` |
| Controllers command | `api-response` | Solo status HTTP, sin body |
| DI | `api-di` | Token `Symbol` junto a interface en domain |
| Tests | `api-testing` | Espejan estructura `test/{bc}/{module}/`, Object Mothers |

---

## Fase 4 — Naming: sufijos permitidos

| Sufijo | Cuándo |
|--------|--------|
| `Repository` | Interface de persistencia en domain |
| `Event` | Domain events |
| `Exception` / error de dominio | Errores tipados |
| `Entity` | TypeORM en infrastructure |
| `TypeOrm` (prefijo) | Implementación concreta de repo/query |

**Prohibido** en clases/archivos de dominio y application:
- `Service` — usar `AchievementCatalogFinder`, `FlashcardFinder`
- `Dto` en application — usar `Request*` / `Response*`
- `.response.ts` por controller

---

## Fase 5 — Orden de refactor recomendado

1. **Límites y submódulos** — estructura de carpetas + `shared/infrastructure/framework/{bc}.module.ts`
2. **Dominio** — aggregates, VOs, eventos desde aggregate
3. **Application** — use cases, extraer lógica de subscribers
4. **Infrastructure** — repos, controllers con envelope
5. **Tests** — migrar paths, añadir domain unit tests faltantes
6. **Cliente** — `res.data.data` + tipos `ApiEnvelope<T>`

---

## Fase 6 — Fuente de verdad duplicada

Señales de alerta (ej. `achievement` pre-refactor):
- Catálogo en código **y** en DB sin uso
- Reglas hardcodeadas en subscribers **y** en evaluators
- i18n en cliente **y** title/description en API sin contrato

Decidir **una** fuente y documentar en ADR si es decisión de producto.

---

## Anti-patterns

```typescript
// ❌ BC entero dentro de identity/user porque se muestra en /profile
// ❌ Subscriber con reglas de negocio en on()
// ❌ Evento publicado manualmente en use case sin aggregate.record()
// ❌ GET devuelve { data } sin meta
// ❌ achievement-catalog-finder.service.ts  ← sufijo Service prohibido
```

---

## Referencias en este repo

- [apps/api/AGENTS.md](../../apps/api/AGENTS.md) — submódulos DDD
- [docs/domain/bounded-contexts.md](../../docs/domain/bounded-contexts.md) — mapa de BCs
- [docs/adr/028-achievements-system.md](../../docs/adr/028-achievements-system.md) — decisiones achievement v2
