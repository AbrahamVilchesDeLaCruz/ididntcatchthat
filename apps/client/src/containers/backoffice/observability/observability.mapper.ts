import type {
  MetricsSummaryApiModel,
  MetricApiModel,
  MetricSampleApiModel,
} from './api/observability.api-model';
import type { DbStatsApiModel } from './api/db-stats.api-model';
import type {
  MetricsSummaryVM,
  MetricVM,
  MetricSampleVM,
  DbStatsVM,
} from './observability.types';

function mapMetricSample(raw: MetricSampleApiModel): MetricSampleVM {
  return { labels: raw.labels, value: raw.value };
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
  return { metrics: raw.metrics.map(mapMetric) };
}

export function mapDbStats(raw: DbStatsApiModel): DbStatsVM {
  return raw as DbStatsVM;
}
