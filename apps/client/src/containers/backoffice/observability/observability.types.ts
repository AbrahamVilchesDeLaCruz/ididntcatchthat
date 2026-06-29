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

export type StatPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

export interface DbStatsVM {
  period: StatPeriod;
  pageViews: {
    total: number;
    uniqueVisitors: number;
    registeredVisitors: number;
    conversionRate: number;
    topPages: { path: string; views: number }[];
    byPeriod: { date: string; views: number; unique: number }[];
  };
  games: {
    total: number;
    completed: number;
    completionRate: number;
    byPeriod: { date: string; started: number; completed: number }[];
    byMode: { mode: string; count: number }[];
    topModules: { module: string; count: number }[];
  };
  flashcards: {
    total: number;
    createdInPeriod: number;
    byPeriod: { date: string; count: number }[];
    audioStatus: { pending: number; done: number; error: number };
    byCategory: { category: string; count: number }[];
  };
}
