import { Inject, Injectable } from '@nestjs/common';
import { Registry } from 'prom-client';
import { METRICS_REGISTRY } from '@/shared/domain/metrics-registry';
import { type MetricsSummaryQuery } from '@/observability/application/summary/metrics-summary.query';
import { type ResponseMetricsSummaryRetriever } from '@/observability/application/summary/response-metrics-summary-retriever';

@Injectable()
export class PrometheusMetricsSummaryQuery implements MetricsSummaryQuery {
  constructor(
    @Inject(METRICS_REGISTRY)
    private readonly registry: Registry,
  ) {}

  async execute(): Promise<ResponseMetricsSummaryRetriever> {
    const metricsJson = await this.registry.getMetricsAsJSON();

    return {
      metrics: metricsJson.map((metric) => ({
        name: metric.name,
        help: metric.help,
        type: metric.type as unknown as string,
        samples: (metric.values ?? []).map((v) => ({
          labels: (v.labels ?? {}) as Record<string, string>,
          value: v.value,
        })),
      })),
    };
  }
}
