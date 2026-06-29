import { type ResponseDbStats, type StatPeriod } from './db-stats.response';

export interface DbStatsQuery {
  execute(period: StatPeriod): Promise<ResponseDbStats>;
}
