import {
  type ResponseAnalyticsSummaryRetriever,
  type SummaryPeriod,
} from './response-analytics-summary-retriever';

export const ANALYTICS_SUMMARY_QUERY = Symbol('AnalyticsSummaryQuery');

export interface AnalyticsSummaryQuery {
  execute(period: SummaryPeriod): Promise<ResponseAnalyticsSummaryRetriever>;
}
