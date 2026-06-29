import type { MetricVM } from '../observability.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMetric(metrics: MetricVM[], name: string): MetricVM | undefined {
  return metrics.find((x) => x.name === name);
}

function sumAllSamples(m: MetricVM | undefined): number {
  if (!m) return 0;
  return m.samples.reduce((acc, s) => acc + s.value, 0);
}

function statusClass(status: string): '2xx' | '3xx' | '4xx' | '5xx' | 'other' {
  if (status.startsWith('2')) return '2xx';
  if (status.startsWith('3')) return '3xx';
  if (status.startsWith('4')) return '4xx';
  if (status.startsWith('5')) return '5xx';
  return 'other';
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

export interface HttpBreakdownRow {
  handler: string;
  method: string;
  status: string;
  count: number;
  statusClass: '2xx' | '3xx' | '4xx' | '5xx' | 'other';
}

export interface HttpStats {
  totalRequests: number;
  successRate: number;
  clientErrorRate: number;
  serverErrorRate: number;
  /** @deprecated use serverErrorRate */
  errorRate: number;
  breakdown: HttpBreakdownRow[];
}

export function parseHttpStats(metrics: MetricVM[]): HttpStats | null {
  const m = getMetric(metrics, 'http_requests_total');
  if (!m) return null;

  const samples = m.samples.filter((s) => !('le' in s.labels));
  const totalRequests = samples.reduce((sum, s) => sum + s.value, 0);

  if (totalRequests === 0) {
    return {
      totalRequests: 0,
      errorRate: 0,
      serverErrorRate: 0,
      clientErrorRate: 0,
      successRate: 0,
      breakdown: [],
    };
  }

  const getStatus = (s: (typeof samples)[0]): string =>
    s.labels.status_code ?? s.labels.status ?? s.labels.code ?? '';

  const serverErrors = samples
    .filter((s) => getStatus(s).startsWith('5'))
    .reduce((sum, s) => sum + s.value, 0);

  const clientErrors = samples
    .filter((s) => getStatus(s).startsWith('4'))
    .reduce((sum, s) => sum + s.value, 0);

  const successes = samples
    .filter((s) => getStatus(s).startsWith('2'))
    .reduce((sum, s) => sum + s.value, 0);

  const breakdown: HttpBreakdownRow[] = samples
    .map((s) => {
      const status = getStatus(s) || '—';
      return {
        handler:
          s.labels.route ??
          s.labels.handler ??
          s.labels.endpoint ??
          s.labels.path ??
          '—',
        method: s.labels.method ?? '—',
        status,
        count: s.value,
        statusClass: statusClass(status),
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalRequests,
    successRate: (successes / totalRequests) * 100,
    clientErrorRate: (clientErrors / totalRequests) * 100,
    serverErrorRate: (serverErrors / totalRequests) * 100,
    errorRate: (serverErrors / totalRequests) * 100,
    breakdown,
  };
}

// ─── Latency (histogram) ──────────────────────────────────────────────────────

export interface LatencyPercentiles {
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  avgMs: number | null;
}

export function parseLatencyPercentiles(
  metrics: MetricVM[],
): LatencyPercentiles | null {
  const m = getMetric(metrics, 'http_request_duration_seconds');
  if (!m) return null;

  const buckets = m.samples
    .filter((s) => 'le' in s.labels)
    .reduce<Map<number, number>>((acc, s) => {
      const le = s.labels.le === '+Inf' ? Infinity : Number(s.labels.le);
      acc.set(le, (acc.get(le) ?? 0) + s.value);
      return acc;
    }, new Map());

  if (buckets.size === 0) return null;

  const sorted = [...buckets.entries()].sort(([a], [b]) => a - b);
  const totalCount = sorted[sorted.length - 1]?.[1] ?? 0;

  if (totalCount === 0) return null;

  const findPercentile = (p: number): number | null => {
    const target = totalCount * p;
    const entry = sorted.find(([, count]) => count >= target);
    if (!entry || entry[0] === Infinity) return null;
    return entry[0] * 1000;
  };

  // prom-client exports _sum and _count as separate metric entries
  const sumMetric = getMetric(metrics, 'http_request_duration_seconds_sum');
  const countMetric = getMetric(metrics, 'http_request_duration_seconds_count');
  const totalSum = sumAllSamples(sumMetric);
  const metricCount = sumAllSamples(countMetric);
  const avgMs =
    totalSum > 0 && metricCount > 0 ? (totalSum / metricCount) * 1000 : null;

  return {
    p50Ms: findPercentile(0.5),
    p95Ms: findPercentile(0.95),
    p99Ms: findPercentile(0.99),
    avgMs,
  };
}

// ─── Runtime (Node.js) ───────────────────────────────────────────────────────

export interface RuntimeMetrics {
  heapUsedBytes: number | null;
  heapTotalBytes: number | null;
  heapUsedPct: number | null;
  eventLoopLagP95Ms: number | null;
  gcDurationTotalSeconds: number | null;
  processStartTimestamp: number | null;
  uptimeSeconds: number | null;
  activeHandles: number | null;
  cpuSecondsTotal: number | null;
  residentMemoryBytes: number | null;
}

export function parseRuntimeMetrics(metrics: MetricVM[]): RuntimeMetrics {
  const heapUsed = sumAllSamples(
    getMetric(metrics, 'nodejs_heap_size_used_bytes'),
  );
  const heapTotal = sumAllSamples(
    getMetric(metrics, 'nodejs_heap_size_total_bytes'),
  );

  const eventLoopMetric = getMetric(
    metrics,
    'nodejs_eventloop_lag_p95_seconds',
  );
  const eventLoopLagP95Ms = eventLoopMetric
    ? sumAllSamples(eventLoopMetric) * 1000
    : null;

  const gcSumMetric = getMetric(metrics, 'nodejs_gc_duration_seconds_sum');
  const gcDurationTotalSeconds = gcSumMetric
    ? sumAllSamples(gcSumMetric)
    : null;

  const startMetric = getMetric(metrics, 'process_start_time_seconds');
  const processStartTimestamp = startMetric
    ? sumAllSamples(startMetric) * 1000
    : null;
  const uptimeSeconds =
    processStartTimestamp !== null
      ? (Date.now() - processStartTimestamp) / 1000
      : null;

  const activeHandles = sumAllSamples(
    getMetric(metrics, 'nodejs_active_handles_total'),
  );
  const cpuSecondsTotal = sumAllSamples(
    getMetric(metrics, 'process_cpu_seconds_total'),
  );
  const residentMemoryBytes = sumAllSamples(
    getMetric(metrics, 'process_resident_memory_bytes'),
  );

  return {
    heapUsedBytes: heapUsed || null,
    heapTotalBytes: heapTotal || null,
    heapUsedPct: heapUsed && heapTotal ? (heapUsed / heapTotal) * 100 : null,
    eventLoopLagP95Ms: eventLoopMetric ? eventLoopLagP95Ms : null,
    gcDurationTotalSeconds,
    processStartTimestamp,
    uptimeSeconds,
    activeHandles: activeHandles || null,
    cpuSecondsTotal: cpuSecondsTotal || null,
    residentMemoryBytes: residentMemoryBytes || null,
  };
}

// ─── Business metrics ─────────────────────────────────────────────────────────

export interface BusinessMetrics {
  gamesStarted: number;
  gamesCompleted: number;
  completionRate: number | null;
  flashcardsCreated: number;
  audioGenerated: number;
  audioErrors: number;
  loginsByProvider: Record<string, number>;
  registrationsByProvider: Record<string, number>;
  totalLogins: number;
  totalRegistrations: number;
}

export function parseBusinessMetrics(metrics: MetricVM[]): BusinessMetrics {
  const gamesStarted = sumAllSamples(
    getMetric(metrics, 'app_games_started_total'),
  );
  const gamesCompleted = sumAllSamples(
    getMetric(metrics, 'app_games_completed_total'),
  );

  const completionRate =
    gamesStarted > 0 ? (gamesCompleted / gamesStarted) * 100 : null;

  const flashcardsCreated = sumAllSamples(
    getMetric(metrics, 'app_flashcards_created_total'),
  );

  const audioMetric = getMetric(metrics, 'app_audio_generated_total');
  const audioErrorMetric = getMetric(metrics, 'app_audio_errors_total');
  const audioGenerated = sumAllSamples(audioMetric);
  const audioErrors = sumAllSamples(audioErrorMetric);

  const loginsByProvider: Record<string, number> = {};
  const loginsMetric = getMetric(metrics, 'app_auth_logins_total');
  if (loginsMetric) {
    for (const s of loginsMetric.samples) {
      const provider = s.labels.provider ?? 'unknown';
      loginsByProvider[provider] = (loginsByProvider[provider] ?? 0) + s.value;
    }
  }

  const registrationsByProvider: Record<string, number> = {};
  const regsMetric = getMetric(metrics, 'app_auth_registrations_total');
  if (regsMetric) {
    for (const s of regsMetric.samples) {
      const provider = s.labels.provider ?? 'unknown';
      registrationsByProvider[provider] =
        (registrationsByProvider[provider] ?? 0) + s.value;
    }
  }

  return {
    gamesStarted,
    gamesCompleted,
    completionRate,
    flashcardsCreated,
    audioGenerated,
    audioErrors,
    loginsByProvider,
    registrationsByProvider,
    totalLogins: Object.values(loginsByProvider).reduce((a, b) => a + b, 0),
    totalRegistrations: Object.values(registrationsByProvider).reduce(
      (a, b) => a + b,
      0,
    ),
  };
}

// ─── Metric grouping ─────────────────────────────────────────────────────────

const CATEGORY_PREFIXES: Array<{ prefix: string; label: string }> = [
  { prefix: 'http_', label: 'HTTP' },
  { prefix: 'nodejs_', label: 'Node.js' },
  { prefix: 'process_', label: 'Proceso' },
  { prefix: 'nestjs_', label: 'NestJS' },
  { prefix: 'app_', label: 'Aplicación' },
];

export function groupMetricsByCategory(
  metrics: MetricVM[],
): Array<{ category: string; metrics: MetricVM[] }> {
  const grouped = new Map<string, MetricVM[]>();

  for (const metric of metrics) {
    const match = CATEGORY_PREFIXES.find(({ prefix }) =>
      metric.name.startsWith(prefix),
    );
    const category = match?.label ?? 'Sistema';
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category)!.push(metric);
  }

  const order = [
    'HTTP',
    'NestJS',
    'Aplicación',
    'Node.js',
    'Proceso',
    'Sistema',
  ];
  return [...grouped.entries()]
    .sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .map(([category, items]) => ({ category, metrics: items }));
}
