import { Inject, Injectable } from '@nestjs/common';
import {
  type UserStatsQuery,
  USER_STATS_QUERY,
  type UserStatPeriod,
} from './user-stats.query';
import { type ResponseUserStatsRetriever } from './response-user-stats-retriever';

@Injectable()
export class UserStatsRetriever {
  constructor(
    @Inject(USER_STATS_QUERY)
    private readonly query: UserStatsQuery,
  ) {}

  async execute(period: UserStatPeriod): Promise<ResponseUserStatsRetriever> {
    return this.query.execute(period);
  }
}
