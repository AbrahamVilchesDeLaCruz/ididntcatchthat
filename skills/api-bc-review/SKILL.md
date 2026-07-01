---
name: api-bc-review
description: >
  Proceso de revisión y refactor de bounded contexts en apps/api/: límites DDD, submódulos,
  alineación con skills y checklist de deuda. Trigger: Al auditar un BC existente, dividir
  agregados en submódulos, o evaluar si un concepto merece BC propio.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.1"
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
4. **Infrastructure** — repos, controllers con envelope, **entity + migration en `typeorm-data-source-options.ts`**
5. **Tests unitarios** — migrar paths, Object Mothers, policies/strategies de dominio
6. **Operabilidad y contrato** — logger, Swagger, docs (ver Fase 7)
7. **E2E API** — al menos un `*.e2e-spec.ts` por endpoint HTTP del BC
8. **Cliente** — `ApiEnvelope<T>` + i18n si el copy vive en frontend

---

## Fase 6 — Fuente de verdad duplicada

Señales de alerta (ej. `achievement` pre-refactor):
- Catálogo en código **y** en DB sin uso
- Reglas hardcodeadas en subscribers **y** en evaluators
- i18n en cliente **y** title/description en API sin contrato

Decidir **una** fuente y documentar en ADR si es decisión de producto.

**Paridad código ↔ migraciones:** si el catálogo vive en dominio, añadir test de paridad (`{bc}-catalog-parity.spec.ts`) que compare keys del catálogo con seed de migraciones y `ALL_*_KEY_VALUES`.

---

## Fase 7 — Operabilidad, contrato y documentación

Auditar **después** de límites y capas DDD. Cargar la skill indicada antes de corregir cada fila.

| Área | Skill | Qué verificar |
|------|-------|---------------|
| **Logger** | `api-observability` | `LOGGER_SERVICE` inyectado en domain services / use cases que mutan estado relevante (`unlock`, `create`, `import`). Log `info` con contexto (`userId`, aggregate id). **No** loguear en controllers — lo hace el filter/interceptor |
| **Swagger** | `api-rest` | Por endpoint GET: `@ApiOperation`, `@ApiBearerAuth('access-token')`, `@ApiProperty`/`@ApiPropertyOptional` en Query/Payload, `@ApiResponse` con schema del envelope `{ data, meta }`, códigos 401/422. Solo `@ApiTags` = incompleto |
| **Docs BC** | — | `docs/apps/api/{bc}/README.md`: submódulos, endpoints, eventos consumidos/publicados, tablas, handlers **v2** (nombres reales de subscribers) |
| **Docs transversales** | — | Sincronizar si el BC emite/consume eventos: `docs/spec/{feature}.md`, `docs/domain/bounded-contexts.md` (diagrama + tabla), `docs/domain/rabbitmq-design.md` (exchanges, colas, handlers) |
| **TypeORM** | `api-migrations` | Toda entidad nueva en `typeOrmEntities` **y** su migración en `typeOrmMigrations`. Omitirlo rompe E2E/CI silenciosamente vía subscribers async |
| **E2E API** | `api-testing` | `test/{bc}/**/infrastructure/*.e2e-spec.ts`: JWT, envelope, happy path de negocio, validación 422. Reutilizar helpers de otros BCs (`registerAndLogin`, `waitUntil`) |
| **Object Mothers** | `api-testing` | `test/{bc}/{module}/domain/*-mother.ts` para aggregates/VOs usados en ≥2 specs. Evitar `fromPrimitives` inline repetido |
| **Tests de dominio crítico** | `api-testing` | Policies, strategies y reglas de elegibilidad con tests propios (no solo vía unlocker integration) |
| **Cliente** | `client-api` | `ApiEnvelope<T>` en fetches, mapper + types, i18n si API devuelve solo keys estructurales |
| **Métricas custom** | `api-observability` | Opcional TFM — contadores Prometheus en mutaciones clave (`*_total`). Infra HTTP/AMQP ya cubierta globalmente |

### Señales de lag documental (ej. `achievement` pre-fix)

- Handler names v1 en spec (`UnlockAchievementOnGameCompleted` vs `UnlockUserAchievementOnGameCompleted`)
- Eventos consumidos incompletos (`AttemptRecorded`/`FlashcardViewed` faltaban en bounded-contexts)
- Colas RabbitMQ sin documentar (`update_progress_on_attempt_recorded`)
- README sin tablas nuevas (`user_achievement_progress`)

### Commits sugeridos por responsabilidad

Separar en work units reviewables — un commit por área:

```
feat({bc}): log {evento} in {DomainService}
feat({bc}): document GET /{recurso} in OpenAPI
docs({bc}): sync spec, bounded-contexts and rabbitmq design
test({bc}): add catalog/domain parity tests
test({bc}): add GET /{recurso} e2e coverage
test({bc}): add domain object mothers
feat(client): type {recurso} API response with ApiEnvelope
```

---

## Anti-patterns

```typescript
// ❌ BC entero dentro de identity/user porque se muestra en /profile
// ❌ Subscriber con reglas de negocio en on()
// ❌ Evento publicado manualmente en use case sin aggregate.record()
// ❌ GET devuelve { data } sin meta
// ❌ achievement-catalog-finder.service.ts  ← sufijo Service prohibido
// ❌ Controller solo con @ApiTags — sin @ApiOperation ni schema de respuesta
// ❌ Unlock/mutación de negocio sin logger.info con contexto
// ❌ Entidad TypeORM sin registrar en typeorm-data-source-options.ts
// ❌ Nuevo subscriber sin fila en rabbitmq-design.md y bounded-contexts.md
// ❌ E2E que solo mockea unit — ningún *.e2e-spec.ts para el endpoint HTTP
```

---

## Referencias en este repo

- [apps/api/AGENTS.md](../../apps/api/AGENTS.md) — submódulos DDD
- [docs/domain/bounded-contexts.md](../../docs/domain/bounded-contexts.md) — mapa de BCs
- [docs/domain/rabbitmq-design.md](../../docs/domain/rabbitmq-design.md) — colas y handlers
- [docs/apps/api/achievement/README.md](../../docs/apps/api/achievement/README.md) — ejemplo docs BC v2
- [docs/adr/028-achievements-system.md](../../docs/adr/028-achievements-system.md) — decisiones achievement v2
