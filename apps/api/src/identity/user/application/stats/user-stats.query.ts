import { type ResponseUserStatsRetriever } from './response-user-stats-retriever';

export type UserStatPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

export const USER_STATS_QUERY = Symbol('USER_STATS_QUERY');

export interface UserStatsQuery {
  execute(period: UserStatPeriod): Promise<ResponseUserStatsRetriever>;
}
