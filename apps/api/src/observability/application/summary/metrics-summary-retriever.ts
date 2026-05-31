import { Inject, Injectable } from '@nestjs/common';
import {
  type MetricsSummaryQuery,
  METRICS_SUMMARY_QUERY,
} from './metrics-summary.query';
import { type ResponseMetricsSummaryRetriever } from './response-metrics-summary-retriever';

@Injectable()
export class MetricsSummaryRetriever {
  constructor(
    @Inject(METRICS_SUMMARY_QUERY)
    private readonly query: MetricsSummaryQuery,
  ) {}

  async execute(): Promise<ResponseMetricsSummaryRetriever> {
    return this.query.execute();
  }
}
