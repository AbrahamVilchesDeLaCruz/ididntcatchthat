import type {
  MetricsSummaryApiModel,
  MetricApiModel,
  MetricSampleApiModel,
} from './api/observability.api-model';
import type {
  MetricsSummaryVM,
  MetricVM,
  MetricSampleVM,
} from './observability.types';

function mapMetricSample(raw: MetricSampleApiModel): MetricSampleVM {
  return {
    labels: raw.labels,
    value: raw.value,
  };
}

function mapMetric(raw: MetricApiModel): MetricVM {
  return {
    name: raw.name,
    help: raw.help,
    type: raw.type,
    samples: raw.samples.map(mapMetricSample),
  };
}

export function mapMetricsSummary(
  raw: MetricsSummaryApiModel,
): MetricsSummaryVM {
  return {
    metrics: raw.metrics.map(mapMetric),
  };
}
