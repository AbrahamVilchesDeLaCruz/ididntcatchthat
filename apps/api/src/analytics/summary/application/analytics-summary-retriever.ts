import { Inject, Injectable } from '@nestjs/common';
import {
  type AnalyticsSummaryQuery,
  ANALYTICS_SUMMARY_QUERY,
} from './analytics-summary.query';
import {
  type ResponseAnalyticsSummaryRetriever,
  type SummaryPeriod,
} from './response-analytics-summary-retriever';

@Injectable()
export class AnalyticsSummaryRetriever {
  constructor(
    @Inject(ANALYTICS_SUMMARY_QUERY)
    private readonly query: AnalyticsSummaryQuery,
  ) {}

  async execute(
    period: SummaryPeriod,
  ): Promise<ResponseAnalyticsSummaryRetriever> {
    return this.query.execute(period);
  }
}
