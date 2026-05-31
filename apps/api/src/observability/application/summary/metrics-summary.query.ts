import { type ResponseMetricsSummaryRetriever } from './response-metrics-summary-retriever';

export const METRICS_SUMMARY_QUERY = Symbol('METRICS_SUMMARY_QUERY');

export interface MetricsSummaryQuery {
  execute(): Promise<ResponseMetricsSummaryRetriever>;
}
