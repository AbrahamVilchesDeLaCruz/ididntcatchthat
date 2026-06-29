import { Inject, Injectable } from '@nestjs/common';
import { type DbStatsQuery } from './db-stats.query';
import { type ResponseDbStats, type StatPeriod } from './db-stats.response';
import { ANALYTICS_TOKENS } from '@/analytics/infrastructure/framework/analytics.tokens';

@Injectable()
export class DbStatsRetriever {
  constructor(
    @Inject(ANALYTICS_TOKENS.DB_STATS_QUERY)
    private readonly query: DbStatsQuery,
  ) {}

  async execute(period: StatPeriod): Promise<ResponseDbStats> {
    return this.query.execute(period);
  }
}
