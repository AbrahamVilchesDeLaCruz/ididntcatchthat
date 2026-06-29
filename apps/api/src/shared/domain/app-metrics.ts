export interface AppMetrics {
  increment(metric: string, labels?: Record<string, string>): void;
}

export const APP_METRICS = Symbol('AppMetrics');
