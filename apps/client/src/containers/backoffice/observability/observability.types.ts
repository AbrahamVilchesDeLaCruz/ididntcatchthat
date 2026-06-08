// ─── ViewModel types ──────────────────────────────────────────────────────────

export interface MetricSampleVM {
  labels: Record<string, string>;
  value: number;
}

export interface MetricVM {
  name: string;
  help: string;
  type: string;
  samples: MetricSampleVM[];
}

export interface MetricsSummaryVM {
  metrics: MetricVM[];
}
