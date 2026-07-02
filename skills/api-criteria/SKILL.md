---
name: api-criteria
description: "Convenciones del patrón Criteria en la API: construcción desde query params, uso en use cases y repositorios. Trigger: Al construir queries con filtros, orden o paginación en apps/api/."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al implementar un endpoint con filtros, orden o paginación
- Al pasar criterios de búsqueda desde controller a use case a repositorio
- Al implementar `match(criteria)` en un repositorio TypeORM

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/repository-criteria.md` para la implementación completa del `match()`, el flujo Controller → UseCase → Repository y la tabla de operadores.

---

## Estructura de `Criteria`

`Criteria` vive en `shared/domain/` — es transversal a todos los bounded contexts:

```typescript
// shared/domain/criteria.ts
export class Criteria {
  constructor(
    readonly filters: Filter[] = [],
    readonly order: Order | null = null,
    readonly limit: number | null = null,
    readonly offset: number | null = null,
  ) {}
}

export enum FilterOperator {
  EQ = '=', NEQ = '!=',
  GT = '>', LT = '<', GTE = '>=', LTE = '<=',
  LIKE = 'LIKE', IN = 'IN',
}

export enum OrderDirection { ASC = 'ASC', DESC = 'DESC' }

export type Filter = { field: string; operator: FilterOperator; value: unknown; };
export type Order  = { field: string; direction: OrderDirection; };
```

---

## Construcción — siempre `new Criteria([...])`

```typescript
// Criteria con filtros, orden y paginación
const criteria = new Criteria(
  [
    { field: 'userId', operator: FilterOperator.EQ, value: userId },
    { field: 'status', operator: FilterOperator.EQ, value: 'active' },
    { field: 'startedAt', operator: FilterOperator.GTE, value: today },
  ],
  { field: 'startedAt', direction: OrderDirection.DESC },
  20,  // limit
  0,   // offset
);

// value: null → IS NULL / IS NOT NULL (el repositorio lo traduce)
const criteria = new Criteria([
  { field: 'finishedAt', operator: FilterOperator.EQ, value: null },  // IS NULL
]);
```

---

## Filtros opcionales — construcción condicional

Cuando no todos los filtros son obligatorios, construir el array dinámicamente:

```typescript
const filters: Filter[] = [];

if (request.category)
  filters.push({ field: 'category', operator: FilterOperator.EQ, value: request.category });
if (request.subcategory)
  filters.push({ field: 'subcategory', operator: FilterOperator.EQ, value: request.subcategory });

const criteria = new Criteria(filters, null, pageSize, (page - 1) * pageSize);
```

## Paginación con `page`/`pageSize` y `count()`

El cliente envía `page` + `pageSize` (más natural que `offset`). El use case convierte y ejecuta `match` y `count` en paralelo:

```typescript
// request: { page?: number; pageSize?: number }
const page     = request.page     ?? 1;
const pageSize = request.pageSize ?? 20;

const criteria = new Criteria(filters, null, pageSize, (page - 1) * pageSize);

const [items, total] = await Promise.all([
  this.repository.match(criteria),
  this.repository.count(criteria),  // mismo Criteria — sin duplicar filtros
]);

return { data: items.map(i => i.toPrimitives()), total, page, pageSize };
```

El repositorio debe exponer `count(criteria: Criteria): Promise<number>` junto a `match()`.

## Reglas

- `Criteria` lo construyen el **use case o domain services** — nunca el controller ni el repositorio
- El controller pasa primitivos como parte del `Request*` — nunca pasa un objeto `Criteria`
- El repositorio solo consume `Criteria` — nunca recibe filtros sueltos por parámetro
- `value: null` con `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (nunca `= null` en SQL)
- Usar `OrderDirection` enum — no strings literales `'ASC'` / `'DESC'`
- No existe `Criteria.fromPrimitives()` — usar el constructor directamente

---

## Anti-patterns

```typescript
// ❌ Criteria construido en el controller
const criteria = new Criteria([...]);
await this.searcher.execute(criteria); // el use case recibe Request*, no Criteria

// ❌ Repositorio recibe filtros sueltos
async findByUserId(userId: string): Promise<Game[]> {}

// ❌ QueryBuilder directo sin Criteria
this.repo.find({ where: { userId } });

// ❌ match() que ignora criteria
async match(criteria: Criteria): Promise<Game[]> {
  return this.repo.find(); // criteria ignorado
}
```
