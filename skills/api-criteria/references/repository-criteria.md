# Repository Criteria — Reference

## `match()` en repositorio TypeORM — implementación completa

```typescript
async match(criteria: Criteria): Promise<Game[]> {
  const qb = this.gameRepo.createQueryBuilder('g');

  for (const filter of criteria.filters) {
    const param = `p_${filter.field}`;
    if (filter.value === null) {
      if (filter.operator === FilterOperator.EQ) {
        qb.andWhere(`g.${filter.field} IS NULL`);
      } else {
        qb.andWhere(`g.${filter.field} IS NOT NULL`);
      }
    } else {
      qb.andWhere(`g.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }
  }

  if (criteria.order) {
    qb.orderBy(`g.${criteria.order.field}`, criteria.order.direction);
  }

  if (criteria.limit !== null) qb.take(criteria.limit);
  if (criteria.offset !== null) qb.skip(criteria.offset);

  const entities = await qb.getMany();
  return entities.map((e) => this.toDomain(e));
}
```

## Flujo completo: Controller → Use Case → Repository

### Controller — extrae params, pasa primitivos al use case

```typescript
@Get()
async handler(
  @Query() query: SearchGamesGetQuery,
  @CurrentUser() user: UserContext,
): Promise<PaginatedApiResponse<GamePrimitives>> {
  return this.searcher.execute({
    userId: user.userId ?? null,
    status: query.status,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  });
}
```

### Use Case — construye `Criteria`

```typescript
@Injectable()
export class PausedGamesLister {
  async execute(request: RequestPausedGamesLister): Promise<GamePrimitives[]> {
    const criteria = new Criteria(
      [
        { field: 'userId', operator: FilterOperator.EQ, value: request.userId },
        { field: 'status', operator: FilterOperator.EQ, value: 'paused' },
      ],
      { field: 'startedAt', direction: OrderDirection.DESC },
    );

    const games = await this.repository.match(criteria);
    return games.map((g) => g.toPrimitives());
  }
}
```

## Operadores disponibles

| Operador | SQL generado | Caso de uso |
|---|---|---|
| `FilterOperator.EQ` | `= :value` / `IS NULL` | Igualdad exacta, null check |
| `FilterOperator.NEQ` | `!= :value` / `IS NOT NULL` | Diferente de, not null |
| `FilterOperator.GT` | `> :value` | Mayor que (fechas, números) |
| `FilterOperator.LT` | `< :value` | Menor que |
| `FilterOperator.GTE` | `>= :value` | Mayor o igual |
| `FilterOperator.LTE` | `<= :value` | Menor o igual |
| `FilterOperator.LIKE` | `LIKE :value` | Búsqueda parcial — añadir `%` en el value |
| `FilterOperator.IN` | `IN (:...value)` | Lista de valores |
