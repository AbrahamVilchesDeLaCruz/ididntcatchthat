---
name: api-criteria
description: >
  Convenciones del patrón Criteria en la API: construcción desde query params, uso en use cases y repositorios.
  Trigger: Al construir queries con filtros, orden o paginación en apps/api/.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al implementar un endpoint con filtros, orden o paginación
- Al pasar criterios de búsqueda desde controller a use case a repositorio
- Al implementar `match(criteria)` en un repositorio TypeORM

## Critical Patterns

### Estructura de Criteria

`Criteria` vive en `shared/domain/` — es un concepto transversal.

```
shared/domain/criteria/
├── criteria.ts
├── filter.ts         ← FiltersPrimitives, Filter, Operator
├── filters.ts        ← Filters (colección de Filter)
├── order.ts          ← Order, OrderPrimitives
├── order-type.ts     ← OrderTypes enum (ASC, DESC, NONE)
└── pagination.ts     ← Pagination, PaginationPrimitives
```

### Lógica AND / OR

Los filtros top-level se unen por AND. Un array anidado se une por OR internamente y se AND con el resto.

```typescript
// SQL: WHERE start_date >= X AND start_date <= Y AND (assigned_to = Z OR assigned_by = Z)
Criteria.fromPrimitives(
  [
    { field: "startDate", operator: ">=", value: X }, // AND
    { field: "startDate", operator: "<=", value: Y }, // AND
    [
      // AND (
      { field: "assignedTo", operator: "=", value: Z }, //   OR
      { field: "assignedBy", operator: "=", value: Z }, //
    ], // )
  ],
  { orderBy: "startDate", orderType: "ASC" },
  { limit: 10, offset: 0 },
);
```

### Flujo: Controller → Use Case → Repository

**Controller** — extrae query params y los pasa como primitivos al use case:

```typescript
@Get()
async handler(@Query() query: FlashcardQueryDto): Promise<FlashcardPrimitives[]> {
  return this.searcher.execute(
    query.filters ?? [],
    { orderBy: query.orderBy ?? 'createdAt', orderType: query.orderType ?? 'DESC' },
    { limit: query.limit ?? 20, offset: query.offset ?? 0 },
  );
}
```

**Use Case** — construye `Criteria` y lo pasa al repositorio:

```typescript
// flashcards/application/search/flashcard-searcher.ts
@Injectable()
export class FlashcardSearcher {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async execute(
    filters: CriteriaFilterItem[],
    order: OrderPrimitives,
    pagination: PaginationPrimitives,
  ): Promise<FlashcardPrimitives[]> {
    const criteria = Criteria.fromPrimitives(filters, order, pagination);
    const flashcards = await this.repository.match(criteria);
    return flashcards.map((f) => f.toPrimitives());
  }
}
```

**Repository** — aplica `Criteria` sobre el QueryBuilder de TypeORM:

```typescript
async match(criteria: Criteria): Promise<Flashcard[]> {
  const qb = this.repo.createQueryBuilder('flashcard');

  if (criteria.hasFilters()) {
    criteria.filters.value.forEach((filter) => {
      qb.andWhere(`flashcard.${filter.field.value} ${filter.operator.value} :${filter.field.value}`, {
        [filter.field.value]: filter.value.value,
      });
    });
  }

  if (criteria.hasOrGroups()) {
    criteria.orGroups.forEach((group) => {
      const orConditions = group.value.map((f) =>
        `flashcard.${f.field.value} ${f.operator.value} :${f.field.value}`
      );
      qb.andWhere(`(${orConditions.join(' OR ')})`, /* params */);
    });
  }

  if (criteria.hasOrder()) {
    qb.orderBy(`flashcard.${criteria.order.orderBy.value}`, criteria.order.orderType.value as 'ASC' | 'DESC');
  }

  qb.skip(criteria.pagination.offset.value).take(criteria.pagination.limit.value);

  const entities = await qb.getMany();
  return entities.map(this.toDomain.bind(this));
}
```

## Reglas

- `Criteria` lo construye el **use case** — nunca el controller ni el repositorio
- El controller pasa primitivos (`CriteriaFilterItem[]`, `OrderPrimitives`, `PaginationPrimitives`)
- El repositorio solo consume `Criteria` — nunca construye queries con parámetros sueltos
- `Criteria` vive en `shared/domain/` — es reutilizable por todos los features

## Anti-patterns

```typescript
// ❌ Criteria construido en el controller
const criteria = Criteria.fromPrimitives(filters, order, pagination);
await this.searcher.execute(criteria); // el use case recibe primitivos, no Criteria

// ❌ Repositorio recibe filtros sueltos
async findByFront(front: string): Promise<Flashcard[]> {} // usar match(criteria)

// ❌ QueryBuilder directo sin pasar por Criteria
this.repo.find({ where: { front } }); // en un repositorio que implementa match()
```
