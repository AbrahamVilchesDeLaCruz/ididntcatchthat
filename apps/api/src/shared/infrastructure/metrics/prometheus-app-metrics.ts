import { Inject, Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';
import { type AppMetrics } from '@/shared/domain/app-metrics';
import { METRICS_REGISTRY } from '@/observability/infrastructure/framework/metrics-registry.token';

@Injectable()
export class PrometheusAppMetrics implements AppMetrics {
  private readonly counters = new Map<string, Counter>();

  constructor(
    @Inject(METRICS_REGISTRY)
    private readonly registry: Registry,
  ) {}

  increment(metric: string, labels: Record<string, string> = {}): void {
    const counter = this.getOrCreate(metric, Object.keys(labels));
    counter.inc(labels);
  }

  private getOrCreate(name: string, labelNames: string[]): Counter {
    const existing = this.counters.get(name);
    if (existing) return existing;

    const counter = new Counter({
      name,
      help: `Application metric: ${name}`,
      labelNames,
      registers: [this.registry],
    });

    this.counters.set(name, counter);
    return counter;
  }
}
