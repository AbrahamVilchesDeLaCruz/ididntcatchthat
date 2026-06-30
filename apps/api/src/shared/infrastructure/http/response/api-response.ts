export interface ResponseMeta {
  timestamp: string;
  request_id: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export class ApiResponse<T> {
  constructor(
    readonly data: T,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(data: T, requestId: string): ApiResponse<T> {
    return new ApiResponse(data, {
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }
}

export class PaginatedApiResponse<T> {
  constructor(
    readonly data: T[],
    readonly pagination: PaginationMeta,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(
    data: T[],
    pagination: PaginationMeta,
    requestId: string,
  ): PaginatedApiResponse<T> {
    return new PaginatedApiResponse(data, pagination, {
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }
}
