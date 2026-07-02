# api-criteria — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `api-infrastructure` | `match()` en repositorios TypeORM — implementación con QueryBuilder |
| `api-application` | Use cases — dónde se construye el `Criteria` |
| `api-shared` | `Criteria` vive en `shared/domain/` |
| `api-validation` | Query DTOs — de donde vienen los filtros y paginación |

## External Documentation

- [TypeORM — SelectQueryBuilder](https://typeorm.io/select-query-builder) — `andWhere`, `orderBy`, `take`, `skip`
- [TypeORM — Parameter binding](https://typeorm.io/select-query-builder#adding-where-expression) — `:param` syntax para prevenir SQL injection

## Pattern Origin

El patrón Criteria es una forma de encapsular los parámetros de una query en un objeto de dominio. Permite que el use case exprese *qué* quiere buscar sin depender de los detalles de la infraestructura de persistencia.

Referencia: [Specification Pattern — Martin Fowler](https://martinfowler.com/apsupp/spec.pdf) (versión simplificada sin composición booleana)

## SQL Injection Safety

El QueryBuilder usa parámetros nombrados (`:param`) — nunca interpolación de strings. Esto previene SQL injection:

```typescript
// ✅ Seguro — parametrizado
qb.andWhere(`g.${filter.field} = :p_status`, { p_status: filter.value });

// ❌ Vulnerable — interpolación directa
qb.andWhere(`g.status = '${filter.value}'`);
```
