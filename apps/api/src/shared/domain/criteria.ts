/**
 * Stub — implementación completa en la skill api-criteria.
 * Representa los parámetros de búsqueda: filtros, orden y paginación.
 */
export class Criteria {
  constructor(
    readonly filters: Filter[] = [],
    readonly order: Order | null = null,
    readonly limit: number | null = null,
    readonly offset: number | null = null,
  ) {}
}

export type FilterOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'IN';

export type Filter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

export type OrderDirection = 'ASC' | 'DESC';

export type Order = {
  field: string;
  direction: OrderDirection;
};
