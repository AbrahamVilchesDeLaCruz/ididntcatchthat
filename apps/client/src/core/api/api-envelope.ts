export interface ResponseMeta {
  timestamp: string;
  request_id: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: ResponseMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PaginatedApiEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: PaginationMeta;
}
