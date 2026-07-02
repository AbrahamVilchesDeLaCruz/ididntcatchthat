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

export type Filter = { field: string; operator: FilterOperator; value: unknown; };
export type Order = { field: string; direction: 'ASC' | 'DESC'; };
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

## Reglas

- `Criteria` lo construye el **use case** — nunca el controller ni el repositorio
- El controller pasa primitivos como parte del `Request*` del use case
- El repositorio solo consume `Criteria` — nunca recibe filtros sueltos por separado
- `value: null` con `EQ`/`NEQ` → `IS NULL` / `IS NOT NULL` (nunca `= null` en SQL)
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
