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

export enum FilterOperator {
  EQ = '=',
  NEQ = '!=',
  GT = '>',
  LT = '<',
  GTE = '>=',
  LTE = '<=',
  LIKE = 'LIKE',
  IN = 'IN',
}

export type Filter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type Order = {
  field: string;
  direction: OrderDirection;
};
