// ─── Raw API models ───────────────────────────────────────────────────────────

export interface MetricSampleApiModel {
  labels: Record<string, string>;
  value: number;
}

export interface MetricApiModel {
  name: string;
  help: string;
  type: string;
  samples: MetricSampleApiModel[];
}

export interface MetricsSummaryApiModel {
  metrics: MetricApiModel[];
}
