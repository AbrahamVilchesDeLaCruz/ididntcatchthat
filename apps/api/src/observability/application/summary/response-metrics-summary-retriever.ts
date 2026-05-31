export type MetricSample = {
  labels: Record<string, string>;
  value: number;
};

export type MetricEntry = {
  name: string;
  help: string;
  type: string;
  samples: MetricSample[];
};

export type ResponseMetricsSummaryRetriever = {
  metrics: MetricEntry[];
};
