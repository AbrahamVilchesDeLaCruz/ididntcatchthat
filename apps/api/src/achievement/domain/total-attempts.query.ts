import { type UserId } from '@/shared/domain/user-id';

export interface TotalAttemptsQuery {
  getTotalAttempts(userId: UserId): Promise<number>;
}

export const TOTAL_ATTEMPTS_QUERY = Symbol('TotalAttemptsQuery');
