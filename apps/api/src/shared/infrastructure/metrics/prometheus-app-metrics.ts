import { Inject, Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';
import { type AppMetrics } from '@/shared/domain/app-metrics';
import { METRICS_REGISTRY } from '@/observability/infrastructure/framework/metrics-registry.token';

interface MetricDef {
  name: string;
  help: string;
  labelNames: string[];
}

const KNOWN_METRICS: MetricDef[] = [
  {
    name: 'app_games_started_total',
    help: 'Total number of games started',
    labelNames: [],
  },
  {
    name: 'app_games_completed_total',
    help: 'Total number of games completed',
    labelNames: [],
  },
  {
    name: 'app_flashcards_created_total',
    help: 'Total number of flashcards created',
    labelNames: [],
  },
  {
    name: 'app_audio_generated_total',
    help: 'Total number of audio files generated',
    labelNames: ['provider'],
  },
  {
    name: 'app_audio_errors_total',
    help: 'Total number of audio generation errors',
    labelNames: ['provider'],
  },
  {
    name: 'app_auth_logins_total',
    help: 'Total number of successful logins',
    labelNames: ['provider'],
  },
  {
    name: 'app_auth_registrations_total',
    help: 'Total number of user registrations',
    labelNames: ['provider'],
  },
];

@Injectable()
export class PrometheusAppMetrics implements AppMetrics {
  private readonly counters = new Map<string, Counter>();

  constructor(
    @Inject(METRICS_REGISTRY)
    private readonly registry: Registry,
  ) {
    for (const def of KNOWN_METRICS) {
      this.register(def.name, def.help, def.labelNames);
    }
  }

  increment(metric: string, labels: Record<string, string> = {}): void {
    const counter = this.getOrCreate(metric, Object.keys(labels));
    counter.inc(labels);
  }

  private register(name: string, help: string, labelNames: string[]): void {
    if (this.counters.has(name)) return;
    const counter = new Counter({
      name,
      help,
      labelNames,
      registers: [this.registry],
    });
    this.counters.set(name, counter);
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
