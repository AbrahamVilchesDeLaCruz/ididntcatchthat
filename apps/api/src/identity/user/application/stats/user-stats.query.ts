import { type ResponseUserStatsRetriever } from './response-user-stats-retriever';

export const USER_STATS_QUERY = Symbol('USER_STATS_QUERY');

export interface UserStatsQuery {
  execute(): Promise<ResponseUserStatsRetriever>;
}
